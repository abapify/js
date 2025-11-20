import { describe, it, expect } from 'vitest';
import { http } from './helpers';
import { createClient } from './client';
import type { RestContract } from './types';

describe('http helpers', () => {
  describe('get', () => {
    it('should create GET endpoint descriptor', () => {
      const endpoint = http.get('/users');
      expect(endpoint.method).toBe('GET');
      expect(endpoint.path).toBe('/users');
      expect(endpoint.responses).toEqual({ 200: undefined });
    });

    it('should accept query and headers options', () => {
      const endpoint = http.get('/users', {
        query: { page: 'number' },
        headers: { authorization: 'string' },
      });
      expect(endpoint.query).toEqual({ page: 'number' });
      expect(endpoint.headers).toEqual({ authorization: 'string' });
    });
  });

  describe('post', () => {
    it('should create POST endpoint descriptor', () => {
      const endpoint = http.post('/users', { body: { name: 'test' } });
      expect(endpoint.method).toBe('POST');
      expect(endpoint.path).toBe('/users');
      expect(endpoint.body).toEqual({ name: 'test' });
      expect(endpoint.responses).toEqual({ 201: undefined });
    });
  });

  describe('put', () => {
    it('should create PUT endpoint descriptor', () => {
      const endpoint = http.put('/users/1', { body: { name: 'updated' } });
      expect(endpoint.method).toBe('PUT');
      expect(endpoint.path).toBe('/users/1');
      expect(endpoint.body).toEqual({ name: 'updated' });
    });
  });

  describe('patch', () => {
    it('should create PATCH endpoint descriptor', () => {
      const endpoint = http.patch('/users/1', { body: { name: 'patched' } });
      expect(endpoint.method).toBe('PATCH');
      expect(endpoint.path).toBe('/users/1');
    });
  });

  describe('delete', () => {
    it('should create DELETE endpoint descriptor', () => {
      const endpoint = http.delete('/users/1');
      expect(endpoint.method).toBe('DELETE');
      expect(endpoint.path).toBe('/users/1');
      expect(endpoint.responses).toEqual({ 204: undefined });
    });
  });

  describe('head', () => {
    it('should create HEAD endpoint descriptor', () => {
      const endpoint = http.head('/users', { responses: { 200: {} } });
      expect(endpoint.method).toBe('HEAD');
      expect(endpoint.path).toBe('/users');
    });
  });

  describe('options', () => {
    it('should create OPTIONS endpoint descriptor', () => {
      const endpoint = http.options('/users', { responses: { 200: {} } });
      expect(endpoint.method).toBe('OPTIONS');
      expect(endpoint.path).toBe('/users');
    });
  });

  describe('type inference', () => {
    it('should infer types from shortcut syntax', () => {
      interface Post {
        id: string;
        title: string;
      }

      const endpoint = http.get<Post>('/posts/123');

      expect(endpoint.method).toBe('GET');
      expect(endpoint.path).toBe('/posts/123');

      // Type check - this will fail compilation if type inference is broken
      type ResponseType = (typeof endpoint.responses)[200];
      const typeCheck: ResponseType extends Post ? true : false = true;
      expect(typeCheck).toBe(true);
    });
  });
});

// Client type inference test - matches the example usage
describe('client type inference', () => {
  it('should infer return types from contract with shortcut syntax', async () => {
    interface User {
      id: string;
      name: string;
    }

    interface Post {
      id: string;
      title: string;
      author: User;
    }

    // Contract - same as example
    const api = {
      posts: {
        get: (userId: string, postId: string) =>
          http.get<Post>(`/users/${userId}/posts/${postId}`),
      },
    } satisfies RestContract;

    // Mock adapter
    const mockAdapter = {
      request: async () => ({
        id: '1',
        title: 'Test',
        author: { id: '1', name: 'John' },
      }),
    };

    // Create client
    const client = createClient(api, {
      baseUrl: 'https://api.example.com',
      adapter: mockAdapter as any,
    });

    // Call client method
    const post = await client.posts.get('123', 'post-456');

    // Type check - this will fail compilation if type inference is broken
    type PostType = typeof post;
    const titleCheck: PostType extends { title: string } ? true : false = true;
    const authorCheck: PostType extends { author: { name: string } }
      ? true
      : false = true;

    expect(titleCheck).toBe(true);
    expect(authorCheck).toBe(true);
    expect(post.title).toBe('Test');
    expect(post.author.name).toBe('John');
  });
});
