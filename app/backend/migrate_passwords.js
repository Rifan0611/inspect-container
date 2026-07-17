const db = require("./config/db");
const bcrypt = require("bcryptjs");

const migrate = () => {
  console.log("Starting password migration...");
  db.query("SELECT id, username, password FROM accounts", async (err, results) => {
    if (err) {
      console.error("Failed to fetch accounts:", err);
      process.exit(1);
    }

    console.log(`Found ${results.length} accounts to check.`);
    let migratedCount = 0;

    for (const row of results) {
      const { id, username, password } = row;
      const isAlreadyHashed = password.startsWith("$2a$") || password.startsWith("$2b$");
      
      if (isAlreadyHashed) {
        console.log(`Account "${username}" is already hashed.`);
        continue;
      }

      console.log(`Hashing password for "${username}"...`);
      try {
        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE accounts SET password = ? WHERE id = ?",
            [hashedPassword, id],
            (updateErr) => {
              if (updateErr) reject(updateErr);
              else resolve();
            }
          );
        });
        migratedCount++;
        console.log(`Successfully migrated account "${username}".`);
      } catch (hashErr) {
        console.error(`Failed to migrate account "${username}":`, hashErr);
      }
    }

    console.log(`Migration finished. Hashed ${migratedCount} passwords.`);
    process.exit(0);
  });
};

// Start migration
migrate();
