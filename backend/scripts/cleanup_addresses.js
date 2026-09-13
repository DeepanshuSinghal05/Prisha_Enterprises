const { Address } = require('../models');
const { Op } = require('sequelize');

const isDryRun = process.argv.includes('--dry-run');

async function cleanupAddresses() {
  console.log(`Starting duplicate address cleanup... ${isDryRun ? '[DRY RUN]' : '[ACTIVE MODE]'}`);
  const addresses = await Address.findAll({ order: [['created_at', 'ASC']] });

  const normalize = (str) => typeof str === 'string' ? str.trim().toLowerCase() : '';
  const grouped = {};
  
  for (const addr of addresses) {
    const sig = `${addr.user_id}_${normalize(addr.address_line1)}_${normalize(addr.address_line2)}_${normalize(addr.city)}_${normalize(addr.state)}_${normalize(addr.pincode)}_${normalize(addr.phone)}`;
    
    if (!grouped[sig]) {
      grouped[sig] = [];
    }
    grouped[sig].push(addr);
  }

  let deletedCount = 0;

  for (const [sig, duplicates] of Object.entries(grouped)) {
    if (duplicates.length > 1) {
      const defaultIndex = duplicates.findIndex(d => d.is_default);
      const keepIndex = defaultIndex >= 0 ? defaultIndex : 0;
      const keepId = duplicates[keepIndex].id;

      const toDeleteIds = duplicates.filter((_, idx) => idx !== keepIndex).map(d => d.id);
      
      console.log(`User ${duplicates[0].user_id}: Keeping address ID ${keepId}, ${isDryRun ? 'would delete' : 'deleting'} ${toDeleteIds.length} duplicates (${toDeleteIds.join(', ')})`);
      
      if (!isDryRun) {
        await Address.destroy({ where: { id: { [Op.in]: toDeleteIds } } });
      }
      deletedCount += toDeleteIds.length;
    }
  }

  console.log(`Cleanup complete. ${isDryRun ? 'Would have deleted' : 'Deleted'} ${deletedCount} duplicate address rows.`);
}

cleanupAddresses()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  });
