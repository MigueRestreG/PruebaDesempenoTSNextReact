import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creando usuario administrador en Supabase...');
  
  const passwordHash = bcrypt.hashSync('AdminSecure2026*', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flota.com' },
    update: {
      role: 'admin',
    },
    create: {
      email: 'admin@flota.com',
      username: 'admin',
      nombre: 'Administrador Principal',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('✅ Administrador creado/verificado exitosamente:');
  console.log('-------------------------------------------');
  console.log(`✉️  Correo:    ${admin.email}`);
  console.log(`👤 Usuario:   ${admin.username}`);
  console.log(`🔑 Clave:     AdminSecure2026*`);
  console.log(`🛡️  Rol:       ${admin.role}`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
