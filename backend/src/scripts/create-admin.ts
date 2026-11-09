/**
 * Creates or updates one admin account, and nothing else.
 *
 * `npm run seed` also makes admin users, but it begins by deleting the whole
 * catalogue — so it must never be used to recover a login on a live shop. This
 * script only touches the AdminUser row for the email you give it.
 *
 *   ADMIN_EMAIL=admin@eclora.dz ADMIN_PASSWORD='…' npm run admin:create
 *
 * Optional: ADMIN_NAME, ADMIN_ROLE (OWNER | ADMIN | EDITOR | SUPPORT).
 * Re-running it on an existing email resets that account's password and
 * re-activates it, which is the normal way back in after a lockout.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import type { AdminRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const ROLES: AdminRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'SUPPORT'];

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? '';
  const name = process.env.ADMIN_NAME?.trim() || 'Admin Eclora';
  const role = (process.env.ADMIN_ROLE?.toUpperCase() as AdminRole) || 'OWNER';

  if (!email) fail('ADMIN_EMAIL is required.');
  if (!email.includes('@')) fail(`ADMIN_EMAIL does not look like an email: ${email}`);
  if (password.length < 8) fail('ADMIN_PASSWORD is required and must be at least 8 characters.');
  if (!ROLES.includes(role)) fail(`ADMIN_ROLE must be one of ${ROLES.join(', ')} — got ${role}.`);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.adminUser.upsert({
    where: { email },
    // An existing account keeps its name unless one was passed explicitly.
    update: { passwordHash, role, isActive: true, ...(process.env.ADMIN_NAME ? { name } : {}) },
    create: { email, name, passwordHash, role, isActive: true },
  });

  console.log(existing ? `✓ Updated ${user.email}` : `✓ Created ${user.email}`);
  console.log(`  role   : ${user.role}`);
  console.log(`  active : ${user.isActive}`);
  console.log('\nSign in at /admin/login. The catalogue was not touched.');

  const total = await prisma.adminUser.count();
  console.log(`${total} admin account(s) now exist.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
