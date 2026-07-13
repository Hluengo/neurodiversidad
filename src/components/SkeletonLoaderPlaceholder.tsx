import React from 'react';

export const SkeletonLoader: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="data-grid-row animate-pulse bg-white border border-slate-100 rounded-2xl p-6">
        <div className="col-span-3 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-100 skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-slate-100 skeleton" />
            <div className="h-3 w-1/2 bg-slate-100 skeleton" />
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          <div className="h-3 w-full bg-slate-100 skeleton" />
          <div className="h-3 w-2/3 bg-slate-100 skeleton" />
        </div>
        <div className="col-span-2 space-y-2">
          <div className="h-3 w-full bg-slate-100 skeleton" />
          <div className="h-3 w-3/4 bg-slate-100 skeleton" />
        </div>
        <div className="col-span-4 space-y-2">
          <div className="h-3 w-full bg-slate-100 skeleton" />
          <div className="h-3 w-5/6 bg-slate-100 skeleton" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
