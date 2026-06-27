// Permite importar arquivos CSS sem erro de TypeScript
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
