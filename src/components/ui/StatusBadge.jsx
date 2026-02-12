import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    new: "bg-blue-100 text-blue-700",
    reviewing: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-stone-100 text-stone-500"
  };
  const labels = { new: 'Novo', reviewing: 'Em Análise', approved: 'Aprovado', rejected: 'Reprovado' };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border-0 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};