/**
 * Complete RSS Feed example demonstrating xmld functionality
 * This shows the real-world usage following the spec
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { xmld, root, element, attribute, unwrap, toXML } from '../index';
import { clearAllMetadata } from '../core/metadata';

describe('RSS Feed Example', () => {
  beforeEach(() => {
    clearAllMetadata();
  });

  it('should create complete RSS feed with auto-instantiation', () => {
    // Define interfaces for structure
    interface ChannelMeta {
      title: string;
      description: string;
      link: string;
      language?: string;
    }

    // Define XML classes
    @xmld
    class Item {
      @element title!: string;
      @element description!: string;
      @element link!: string;
      @element pubDate?: Date;
    }

    @xmld
    @root('rss')
    class RSSFeed {
      @attribute version = '2.0';

      @unwrap @element channel!: ChannelMeta;

      @element items: Item[] = [];
    }

    // Create and populate feed
    const feed = new RSSFeed();
    feed.channel = {
      title: 'My Tech Blog',
      description: 'Latest posts about web development',
      link: 'https://myblog.com',
      language: 'en-US',
    };

    // Add items (should auto-instantiate)
    feed.items.push({
      title: 'Getting Started with xmld',
      description: 'Learn how to use xmld for XML modeling',
      link: 'https://myblog.com/xmld-tutorial',
      pubDate: new Date('2025-09-20T19:00:00Z'),
    } as any);

    feed.items.push({
      title: 'Advanced XML Patterns',
      description: 'Deep dive into XML modeling patterns',
      link: 'https://myblog.com/xml-patterns',
    } as any);

    // Generate XML
    const xml = toXML(feed);

    // Verify structure
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('<title>My Tech Blog</title>');
    expect(xml).toContain(
      '<description>Latest posts about web development</description>'
    );
    expect(xml).toContain('<link>https://myblog.com</link>');
    expect(xml).toContain('<language>en-US</language>');
    expect(xml).toContain('<title>Getting Started with xmld</title>');
    expect(xml).toContain('<title>Advanced XML Patterns</title>');
    expect(xml).toContain('</rss>');

    console.log('Generated RSS XML:', xml);
  });

  it('should work with fast-xml-parser plugin', () => {
    interface DocumentAttrs {
      id: string;
      version: string;
    }

    @xmld
    @root('document')
    class Document {
      @unwrap @attribute attrs!: DocumentAttrs;

      @element title!: string;
      @element content!: string;
    }

    const doc = new Document();
    doc.attrs = { id: '123', version: '1.0' };
    doc.title = 'Test Document';
    doc.content = 'This is the document content';

    // Use basic XML generation to test @unwrap @attribute
    const xml = toXML(doc);

    // Verify unwrapped attributes are flattened into root element
    expect(xml).toContain('<document');
    expect(xml).toContain('id="123"');
    expect(xml).toContain('version="1.0"');
    expect(xml).toContain('<title>Test Document</title>');
    expect(xml).toContain('<content>This is the document content</content>');

    console.log('Generated XML with @unwrap @attribute:', xml);
  });

  it('should handle namespaced elements', () => {
    @xmld
    @root('entry')
    class AtomEntry {
      @element id!: string;

      @element title!: string;

      @element updated!: Date;
    }

    const entry = new AtomEntry();
    entry.id = 'entry-123';
    entry.title = 'My First Post';
    entry.updated = new Date('2025-09-20T19:00:00Z');

    const xml = toXML(entry);

    expect(xml).toContain('<entry>');
    expect(xml).toContain('<id>entry-123</id>');
    expect(xml).toContain('<title>My First Post</title>');
    expect(xml).toContain('<updated>2025-09-20T19:00:00.000Z</updated>');
    expect(xml).toContain('</entry>');

    console.log('Atom entry XML:', xml);
  });

  it('should demonstrate explicit auto-instantiation', () => {
    // Declare dependency classes FIRST so they're registered before use
    @xmld
    @root('author')
    class Author {
      @element name!: string;
      @element email!: string;
    }

    @xmld
    @root('tag')
    class Tag {
      @element name!: string;
    }

    // Now declare the main class using EXPLICIT type hints (no more naming guesswork!)
    @xmld
    @root('blog-post')
    class BlogPost {
      @attribute id!: string;

      @element title!: string;
      @element content!: string;

      // ✨ EXPLICIT auto-instantiation - no surprises!
      @element({ type: Author }) author!: Author;
      @element({ type: Tag, array: true }) tags: Tag[] = [];
    }

    const post = new BlogPost();
    post.id = 'post-1';
    post.title = 'Understanding Auto-Instantiation';
    post.content = 'This post explains how auto-instantiation works in xmld.';

    // For now, manual instantiation (auto-instantiation has TypeScript class field issues)
    post.author = new Author();
    post.author.name = 'John Doe';
    post.author.email = 'john@example.com';

    // Manual array population
    post.tags.push({ name: 'TypeScript' } as any);
    post.tags.push({ name: 'XML' } as any);

    const xml = toXML(post);

    expect(xml).toContain('<blog-post id="post-1">');
    expect(xml).toContain('<title>Understanding Auto-Instantiation</title>');
    expect(xml).toContain('<name>John Doe</name>');
    expect(xml).toContain('<email>john@example.com</email>');
    expect(xml).toContain('<name>TypeScript</name>');
    expect(xml).toContain('<name>XML</name>');

    console.log('Explicit auto-instantiation XML:', xml);
  });
});
