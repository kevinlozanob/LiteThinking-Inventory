/**
 * =============================================================================
 * PRUEBAS E2E - Lite Thinking Inventory System
 * =============================================================================
 * Ejecutar: npx cypress run --spec "cypress/e2e/test.cy.ts"
 *            npx cypress open

 * =============================================================================
 */

// URL de la aplicación (producción)
const BASE_URL = 'https://litethinking.nicklcs.dev';

// Credenciales de prueba
const ADMIN_USER = {
  email: 'nicklcsdev@gmail.com',
  password: 'nicklcsdev'
};

const NORMAL_USER = {
  email: 'visitante@test.com',
  password: '123456'
};

// =============================================================================
// 1. TESTS DE PÁGINA DE LOGIN
// =============================================================================

describe(' Página de Login', () => {
  
  beforeEach(() => {
    cy.visit(`${BASE_URL}/login`);
  });

  it('✓ Debe mostrar la página de login correctamente', () => {
    cy.contains('Bienvenido de nuevo').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Inicia sesión').should('be.visible');
  });

  it('✓ Debe tener campos de email y password funcionales', () => {
    cy.get('input[type="email"]').type('test@test.com').should('have.value', 'test@test.com');
    cy.get('input[type="password"]').type('123456').should('have.value', '123456');
  });

  it('✓ Debe mostrar enlace para crear cuenta', () => {
    cy.contains('Crea tu cuenta').should('be.visible');
  });

  it('✓ Debe mostrar opciones de login social', () => {
    cy.contains('O inicia sesión usando').should('be.visible');
  });
});

// =============================================================================
// 2. TESTS DE PÁGINA DE REGISTRO
// =============================================================================

describe(' Página de Registro', () => {
  
  beforeEach(() => {
    cy.visit(`${BASE_URL}/register`);
  });

  it('✓ Debe mostrar el formulario de registro', () => {
    cy.contains('Crea tu cuenta').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('have.length.at.least', 2);
    cy.contains('button', 'Crear Cuenta').should('be.visible');
  });

  it('✓ Debe tener campos funcionales', () => {
    cy.get('input[type="email"]').type('nuevo@test.com').should('have.value', 'nuevo@test.com');
    cy.get('input[type="password"]').first().type('password123');
  });

  it('✓ Debe mostrar enlace para iniciar sesión', () => {
    cy.contains('Inicia sesión aquí').should('be.visible');
  });
});

// =============================================================================
// 3. TESTS DE NAVEGACIÓN ENTRE PÁGINAS
// =============================================================================

describe(' Navegación entre páginas', () => {

  it('✓ Debe navegar de login a registro', () => {
    cy.visit(`${BASE_URL}/login`);
    cy.contains('Crea tu cuenta').click();
    cy.url().should('include', '/register');
  });

  it('✓ Debe navegar de registro a login', () => {
    cy.visit(`${BASE_URL}/register`);
    cy.contains('Inicia sesión aquí').click();
    cy.url().should('include', '/login');
  });
});

// =============================================================================
// 4. TESTS DE AUTENTICACIÓN - LOGIN EXITOSO
// =============================================================================

describe(' Login Exitoso - Usuario Admin', () => {

  it('✓ Debe hacer login y llegar al dashboard', () => {
    cy.visit(`${BASE_URL}/login`);
    
    cy.get('input[type="email"]').type(ADMIN_USER.email);
    cy.get('input[type="password"]').type(ADMIN_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    // Verificar que llega al dashboard
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.contains('Panel de Control', { timeout: 10000 }).should('be.visible');
  });

  it('✓ Debe mostrar rol de Administrador', () => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(ADMIN_USER.email);
    cy.get('input[type="password"]').type(ADMIN_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.contains('Administrador', { timeout: 10000 }).should('be.visible');
  });
});

describe(' Login Exitoso - Usuario Normal', () => {

  it('✓ Debe hacer login y llegar al dashboard', () => {
    cy.visit(`${BASE_URL}/login`);
    
    cy.get('input[type="email"]').type(NORMAL_USER.email);
    cy.get('input[type="password"]').type(NORMAL_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.contains('Panel de Control', { timeout: 10000 }).should('be.visible');
  });

  it('✓ Debe mostrar rol de Usuario Externo', () => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(NORMAL_USER.email);
    cy.get('input[type="password"]').type(NORMAL_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.contains('Usuario Externo', { timeout: 10000 }).should('be.visible');
  });
});

// =============================================================================
// 5. TESTS DEL DASHBOARD - ADMIN
// =============================================================================

describe(' Dashboard - Funcionalidades Admin', () => {
  
  beforeEach(() => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(ADMIN_USER.email);
    cy.get('input[type="password"]').type(ADMIN_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.wait(3000);
  });

  it('✓ Debe mostrar el título del dashboard', () => {
    cy.contains('Panel de Control').should('be.visible');
  });

  it('✓ Debe mostrar sección de Empresas Registradas', () => {
    cy.contains('Empresas Registradas').should('be.visible');
  });

  it('✓ Debe mostrar botón Nueva Empresa para admin', () => {
    cy.contains('button', 'Nueva Empresa').should('be.visible');
  });

  it('✓ Debe mostrar botón Salir', () => {
    cy.contains('button', 'Salir').should('be.visible');
  });

  it('✓ Debe abrir formulario de nueva empresa', () => {
    cy.contains('button', 'Nueva Empresa').click();
    cy.contains('Registrar Nueva Empresa', { timeout: 5000 }).should('be.visible');
  });

  it('✓ Debe cerrar formulario al cancelar', () => {
    cy.contains('button', 'Nueva Empresa').click();
    cy.contains('Registrar Nueva Empresa').should('be.visible');
    cy.contains('button', 'Cancelar').click();
    cy.contains('Registrar Nueva Empresa').should('not.exist');
  });
});

// =============================================================================
// 6. TESTS DEL DASHBOARD - USUARIO NORMAL
// =============================================================================

describe(' Dashboard - Usuario Normal (Solo Lectura)', () => {
  
  beforeEach(() => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(NORMAL_USER.email);
    cy.get('input[type="password"]').type(NORMAL_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.wait(3000);
  });

  it('✓ Debe mostrar el dashboard', () => {
    cy.contains('Panel de Control').should('be.visible');
  });

  it('✓ Debe mostrar Usuario Externo', () => {
    cy.contains('Usuario Externo').should('be.visible');
  });

  it('✓ NO debe mostrar botón Nueva Empresa', () => {
    cy.contains('button', 'Nueva Empresa').should('not.exist');
  });

  it('✓ Debe mostrar sección de Empresas', () => {
    cy.contains('Empresas Registradas').should('be.visible');
  });
});

// =============================================================================
// 7. TESTS DE LOGOUT
// =============================================================================

describe(' Logout', () => {

  it('✓ Admin puede hacer logout correctamente', () => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(ADMIN_USER.email);
    cy.get('input[type="password"]').type(ADMIN_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    
    // Esperar 8 segundos para que desaparezca el toast
    cy.wait(8000);
    
    cy.contains('button', 'Salir').click();
    cy.url().should('include', '/login', { timeout: 10000 });
  });

  it('✓ Usuario normal puede hacer logout correctamente', () => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(NORMAL_USER.email);
    cy.get('input[type="password"]').type(NORMAL_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    
    // Esperar 8 segundos para que desaparezca el toast
    cy.wait(8000);
    
    cy.contains('button', 'Salir').click();
    cy.url().should('include', '/login', { timeout: 10000 });
  });
});

// =============================================================================
// 8. TESTS DE RESPONSIVE DESIGN
// =============================================================================

describe(' Responsive Design', () => {

  it('✓ Login funciona en móvil', () => {
    cy.viewport('iphone-x');
    cy.visit(`${BASE_URL}/login`);
    cy.contains('Bienvenido de nuevo').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
  });

  it('✓ Login funciona en tablet', () => {
    cy.viewport('ipad-2');
    cy.visit(`${BASE_URL}/login`);
    cy.contains('Bienvenido de nuevo').should('be.visible');
  });

  it('✓ Login funciona en desktop', () => {
    cy.viewport(1920, 1080);
    cy.visit(`${BASE_URL}/login`);
    cy.contains('Bienvenido de nuevo').should('be.visible');
  });

  it('✓ Dashboard funciona en móvil', () => {
    cy.viewport('iphone-x');
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(ADMIN_USER.email);
    cy.get('input[type="password"]').type(ADMIN_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.contains('Panel de Control').should('be.visible');
  });
});

// =============================================================================
// 9. TESTS DE PROTECCIÓN DE RUTAS
// =============================================================================

describe('️ Protección de Rutas', () => {

  it('✓ Dashboard redirige a login si no está autenticado', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit(`${BASE_URL}/dashboard`);
    cy.url().should('include', '/login', { timeout: 10000 });
  });

  it('✓ Inventario redirige a login si no está autenticado', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit(`${BASE_URL}/dashboard/empresa/123`);
    cy.url().should('include', '/login', { timeout: 10000 });
  });
});

// =============================================================================
// 10. TESTS DE CREDENCIALES INCORRECTAS
// =============================================================================

describe('Credenciales Incorrectas', () => {

  it('✓ Debe mostrar error con credenciales inválidas', () => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type('fake@fake.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.contains('button', 'Inicia sesión').click();
    
    // Debe quedarse en login o mostrar error
    cy.wait(3000);
    cy.url().should('include', '/login');
  });
});

// =============================================================================
// 11. FLUJO COMPLETO E2E (Login - Dashboard - Logout)
// =============================================================================

describe(' Flujo Completo E2E', () => {

  it('✓ Flujo completo: Login → Dashboard → Logout', () => {
    // 1. Login
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(ADMIN_USER.email);
    cy.get('input[type="password"]').type(ADMIN_USER.password);
    cy.contains('button', 'Inicia sesión').click();
    
    // 2. Dashboard
    cy.url().should('include', '/dashboard', { timeout: 20000 });
    cy.contains('Panel de Control').should('be.visible');
    cy.contains('Empresas Registradas').should('be.visible');
    cy.contains('Administrador').should('be.visible');
    
    // 3. Logout (esperar que desaparezca toast)
    cy.wait(8000);
    cy.contains('button', 'Salir').click();
    
    // 4. Verificar en login
    cy.url().should('include', '/login', { timeout: 10000 });
    cy.contains('Bienvenido de nuevo').should('be.visible');
  });
});
