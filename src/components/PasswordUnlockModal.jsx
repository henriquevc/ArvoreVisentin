import React, { useState } from 'react';
import { Lock, Unlock, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function PasswordUnlockModal({
  isOpen,
  onClose,
  onUnlock
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Digite a senha para continuar.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onUnlock(password.trim());
      handleClose();
    } catch (err) {
      setError(err?.message || 'Senha incorreta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF9F5] w-full max-w-md rounded-3xl shadow-2xl border-2 border-[#1b4d3e]/40 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#255734] text-amber-50 p-5 flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Liberar Modo de Edição
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-serif-vintage">
                Proteção contra alterações acidentais
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Digite a senha da família para adicionar novos membros, alterar fotos, ajustar ordens de nascimento ou excluir registros na nuvem.
          </p>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Senha de Edição
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                autoFocus
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 focus:border-emerald-700 bg-white text-sm text-stone-900 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-[#1b4d3e] hover:bg-[#133926] disabled:opacity-60 text-amber-50 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Unlock size={14} />
              <span>{isLoading ? 'Verificando...' : 'Liberar Edição'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
