declare module "in-browser-download" {
  export = index;
  declare function index(data: any, filename: string): void;
  declare namespace index {
    function isSupported(): boolean;
  }
}
