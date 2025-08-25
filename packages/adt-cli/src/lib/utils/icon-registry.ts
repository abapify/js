export class IconRegistry {
  private static icons = new Map<string, string>();

  static {
    // Register SAP object type icons
    this.icons.set('CLAS', '🏛️'); // Classes
    this.icons.set('INTF', '🔌'); // Interfaces
    this.icons.set('DEVC', '📦'); // Packages
    this.icons.set('PROG', '📄'); // Programs
    this.icons.set('FUGR', '📚'); // Function Groups
    this.icons.set('TABL', '🗃️'); // Tables
    this.icons.set('DDLS', '📊'); // CDS Views
    this.icons.set('BDEF', '🎭'); // RAP Behaviors
    this.icons.set('SRVD', '🌐'); // Service Definitions
    this.icons.set('SRVB', '🔗'); // Service Bindings
    this.icons.set('DDLX', '🎨'); // Metadata Extensions
    this.icons.set('DCLS', '🔒'); // Access Controls
    this.icons.set('DTEL', '🏷️'); // Data Elements
    this.icons.set('DOMA', '🎯'); // Domains
    this.icons.set('TTYP', '📋'); // Table Types
    this.icons.set('MSAG', '💬'); // Message Classes
    this.icons.set('WAPA', '📱'); // Fiori Apps
    this.icons.set('SICF', '🌍'); // HTTP Services
    this.icons.set('STOB', '📐'); // Structured Objects
    this.icons.set('NONT', '🎪'); // Node Types
    this.icons.set('RONT', '🎲'); // Root Types
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
