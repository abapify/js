export class IconRegistry {
  private static icons = new Map<string, string>();

  static {
    // Register SAP object type icons
    // Note: Using emojis without variation selectors (️) for consistent terminal width
    this.icons.set('CLAS', '🔷'); // Classes (blue diamond - consistent width)
    this.icons.set('INTF', '🔸'); // Interfaces (small orange diamond)
    this.icons.set('DEVC', '📦'); // Packages
    this.icons.set('PROG', '📄'); // Programs
    this.icons.set('FUGR', '📚'); // Function Groups
    this.icons.set('TABL', '📊'); // Tables
    this.icons.set('DDLS', '📈'); // CDS Views
    this.icons.set('BDEF', '🎭'); // RAP Behaviors
    this.icons.set('SRVD', '🌐'); // Service Definitions
    this.icons.set('SRVB', '🔗'); // Service Bindings
    this.icons.set('DDLX', '🎨'); // Metadata Extensions
    this.icons.set('DCLS', '🔐'); // Access Controls
    this.icons.set('DTEL', '🔤'); // Data Elements (ABC - consistent width)
    this.icons.set('DOMA', '🎯'); // Domains
    this.icons.set('TTYP', '📋'); // Table Types
    this.icons.set('MSAG', '💬'); // Message Classes
    this.icons.set('WAPA', '📱'); // Fiori Apps
    this.icons.set('SICF', '🌍'); // HTTP Services
    this.icons.set('STOB', '📐'); // Structured Objects
    this.icons.set('NONT', '🎪'); // Node Types
    this.icons.set('RONT', '🎲'); // Root Types
    this.icons.set('FUNC', '⚡'); // Function Modules
    this.icons.set('VIEW', '👁'); // Views
    this.icons.set('ENQU', '🔐'); // Lock Objects
    this.icons.set('SHLP', '🔍'); // Search Helps
    this.icons.set('TRAN', '🚀'); // Transactions
    this.icons.set('WDYN', '🌐'); // Web Dynpro
    this.icons.set('XSLT', '🔄'); // XSLT Transformations
  }

  static getIcon(objectType: string): string {
    return this.icons.get(objectType) || '📄'; // Default icon for unknown types
  }

  static register(objectType: string, icon: string): void {
    this.icons.set(objectType, icon);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.icons.keys());
  }

  static hasIcon(objectType: string): boolean {
    return this.icons.has(objectType);
  }
}
