describe('Flujo Completo: Login, Navegación y Logout', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:4173/login'); 
  });

  it('Debe mostrar error si la contraseña está mal', () => {
    cy.get('input[type="email"]').type('usuario@falso.com');
    cy.get('input[type="password"]').type('claveerronea');
    cy.get('button[type="submit"]').click();
    cy.contains('Incorrectas').should('be.visible');
  });

  it('Debe entrar al Dashboard con credenciales reales', () => {
    cy.get('input[type="email"]').type('nicklcsdev@gmail.com');
    cy.get('input[type="password"]').type('nicklcsdev');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Panel de Control').should('be.visible');
    cy.contains('Empresas Registradas').should('be.visible');
  });

  it('Debe cerrar sesión correctamente', () => {
    cy.get('input[type="email"]').type('nicklcsdev@gmail.com');
    cy.get('input[type="password"]').type('nicklcsdev');
    cy.get('button[type="submit"]').click();

    cy.contains('Panel de Control');

    cy.get('button[aria-label="Cerrar sesión"]').click();

    cy.contains('Bienvenido de nuevo').should('be.visible');
  });
});