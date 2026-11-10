'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Loader2, Search, X, Inbox, AlertTriangle, ImageOff } from 'lucide-react';
import type { Tone } from '@/lib/admin/constants';

// ─── Button ─────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-[#f05b2a] to-[#faae3c] text-white hover:brightness-105 disabled:from-slate-400 disabled:to-slate-400',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-black',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed ${
        size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs'
      } ${BUTTON_STYLES[variant]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
}

/** A link styled like a Button (avoids nesting <button> inside <a>). */
export function ButtonLink({
  href,
  variant = 'primary',
  icon: Icon,
  children,
  className = '',
}: {
  href: string;
  variant?: ButtonVariant;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold whitespace-nowrap transition-colors px-4 py-2.5 text-xs ${BUTTON_STYLES[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  icon: Icon,
  tone = 'default',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        tone === 'danger' ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-black hover:bg-slate-100'
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = '',
  padded = true,
}: {
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-2xs ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-sm font-black text-slate-900">{title}</h3>}
            {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

// ─── Form controls ──────────────────────────────────────────────────────────

const CONTROL =
  'min-w-0 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-black font-semibold outline-none focus:ring-2 focus:ring-[#f05b2a] focus:bg-white transition disabled:opacity-60';

export function Field({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 text-xs ${className}`}>
      <span className="font-bold text-slate-700 block mb-1.5">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] text-red-600 font-semibold block mt-1">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-slate-400 block mt-1">{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} {...rest} className={`${CONTROL} ${className}`} />;
  }
);

export function Textarea({ className = '', ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...rest} className={`${CONTROL} font-medium leading-relaxed ${className}`} />;
}

export function Select({ className = '', children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={`${CONTROL} ${className}`}>
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-gradient-to-r from-[#f05b2a] to-[#faae3c]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-xs">
        <div className="font-bold text-slate-800">{label}</div>
        {description && <div className="text-[11px] text-slate-500 mt-0.5">{description}</div>}
      </div>
      {sw}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${CONTROL} pl-9`}
      />
    </div>
  );
}

// ─── Display ────────────────────────────────────────────────────────────────

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  violet: 'bg-violet-50 text-violet-800 border-violet-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-extrabold whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge<K extends string>({ map, value }: { map: Record<K, { label: string; tone: Tone }>; value: K }) {
  const entry = map[value];
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function Thumb({ src, alt, size = 40 }: { src?: string; alt: string; size?: number }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ok = src && failedSrc !== src;
  return (
    <div
      className="rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <ImageOff className="w-1/2 h-1/2 max-w-5 text-slate-300" aria-label={alt || undefined} />
      )}
    </div>
  );
}

export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-xs font-bold text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <AlertTriangle className="w-6 h-6 text-red-500" />
      <p className="text-xs font-bold text-slate-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <Inbox className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-sm font-black text-slate-900">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Tabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: K; label: string; count?: number }[];
  value: K;
  onChange: (id: K) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            value === t.id ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-black'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${value === t.id ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Overlays ───────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        e.preventDefault();
        dialogRef.current.focus();
      } else if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;
  const portalRoot = document.getElementById('admin-overlays');
  if (!portalRoot) return null;
  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' }[size];
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/50 p-3 backdrop-blur-xs sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)] ${width}`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <h3 id={titleId} className="min-w-0 text-base font-black text-slate-900">{title}</h3>
          <IconButton label="Fermer" icon={X} onClick={onClose} />
        </div>
        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-3 sm:px-5 sm:py-4">{footer}</div>}
      </div>
    </div>,
    portalRoot,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Supprimer',
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
    </Modal>
  );
}

// ─── Table helpers ──────────────────────────────────────────────────────────

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 border-b border-slate-100 align-middle ${className}`}>{children}</td>;
}
