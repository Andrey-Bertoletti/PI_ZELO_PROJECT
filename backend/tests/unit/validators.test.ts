import { loginSchema, registerSchema } from '../../src/validators/auth';
import { bookingCreateSchema, budgetSchema, messageSchema, reviewSchema } from '../../src/validators/common';

describe('validators (Zod)', () => {
  describe('registerSchema', () => {
    const base = {
      name: 'Marina',
      email: 'MARINA@ZERO.DEV',
      password: 'Senha@123',
    };

    it('aceita payload mínimo', () => {
      const parsed = registerSchema.parse({ body: base });
      expect(parsed.body.email).toBe('marina@zero.dev'); // normaliza
      expect(parsed.body.role).toBe('CLIENT');
    });

    it('rejeita e-mail inválido', () => {
      expect(() => registerSchema.parse({ body: { ...base, email: 'invalid' } })).toThrow();
    });

    it('rejeita senha muito curta', () => {
      expect(() => registerSchema.parse({ body: { ...base, password: 'abc' } })).toThrow();
    });

    it('rejeita nome curto', () => {
      expect(() => registerSchema.parse({ body: { ...base, name: 'X' } })).toThrow();
    });

    it('aceita telefone válido', () => {
      const parsed = registerSchema.parse({ body: { ...base, phone: '+5511999998888' } });
      expect(parsed.body.phone).toBe('+5511999998888');
    });

    it('rejeita telefone inválido', () => {
      expect(() => registerSchema.parse({ body: { ...base, phone: 'abc' } })).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('exige email e senha', () => {
      expect(() => loginSchema.parse({ body: { email: 'a@b.com' } })).toThrow();
      expect(() => loginSchema.parse({ body: { password: 'x' } })).toThrow();
    });
  });

  describe('bookingCreateSchema', () => {
    const base = {
      providerId: '11111111-1111-1111-1111-111111111111',
      categoryId: 'plumb',
      title: 'Reparo',
      address: 'Rua A, 1',
    };

    it('aceita payload mínimo', () => {
      const r = bookingCreateSchema.parse({ body: base });
      expect(r.body.urgency).toBe('FLEXIBLE');
    });

    it('rejeita providerId não-UUID', () => {
      expect(() => bookingCreateSchema.parse({ body: { ...base, providerId: 'x' } })).toThrow();
    });

    it('rejeita urgency inválida', () => {
      expect(() => bookingCreateSchema.parse({ body: { ...base, urgency: 'ASAP' } })).toThrow();
    });

    it('rejeita preço negativo', () => {
      expect(() => bookingCreateSchema.parse({ body: { ...base, priceEstimate: -1 } })).toThrow();
    });
  });

  describe('reviewSchema', () => {
    it('limita rating entre 1 e 5', () => {
      const bookingId = '11111111-1111-1111-1111-111111111111';
      expect(() => reviewSchema.parse({ body: { bookingId, rating: 0 } })).toThrow();
      expect(() => reviewSchema.parse({ body: { bookingId, rating: 6 } })).toThrow();
      const r = reviewSchema.parse({ body: { bookingId, rating: 5 } });
      expect(r.body.rating).toBe(5);
    });
  });

  describe('messageSchema', () => {
    it('rejeita mensagem vazia', () => {
      const receiverId = '11111111-1111-1111-1111-111111111111';
      expect(() => messageSchema.parse({ body: { receiverId, content: '' } })).toThrow();
    });

    it('aceita mensagem normal', () => {
      const receiverId = '11111111-1111-1111-1111-111111111111';
      const r = messageSchema.parse({ body: { receiverId, content: 'Olá!' } });
      expect(r.body.content).toBe('Olá!');
    });
  });

  describe('budgetSchema', () => {
    it('exige categoryId e answers', () => {
      expect(() => budgetSchema.parse({ body: { answers: {} } })).toThrow();
      expect(() => budgetSchema.parse({ body: { categoryId: 'plumb' } })).toThrow();
      const r = budgetSchema.parse({ body: { categoryId: 'plumb', answers: { service: 'leak' } } });
      expect(r.body.answers.service).toBe('leak');
    });
  });
});
