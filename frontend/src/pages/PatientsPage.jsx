import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

function RiskBadge({ level }) {
  return <span className={`risk-badge ${level}`}>{level}</span>;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [admTypeFilter, setAdmTypeFilter] = useState('');

  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (search)      params.search        = search;
      if (riskFilter)  params.risk_level    = riskFilter;
      if (genderFilter) params.gender       = genderFilter;
      if (admTypeFilter) params.admission_type = admTypeFilter;
      const res = await api.get('/patients/', { params });
      setPatients(res.data.patients);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [page, search, riskFilter, genderFilter, admTypeFilter]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, riskFilter, genderFilter, admTypeFilter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Patient List</div>
          <div className="page-subtitle">{total.toLocaleString()} patients found</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} className="search-icon" />
          <input className="input" placeholder="Search by patient ID or diagnosis..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="input" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
          <option value="">All Risk Levels</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>

        <select className="input" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="">All Genders</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        <select className="input" value={admTypeFilter} onChange={e => setAdmTypeFilter(e.target.value)}>
          <option value="">All Admission Types</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="ELECTIVE">Elective</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Admission Type</th>
                <th>Diagnosis</th>
                <th>ICU Unit</th>
                <th>ICU LOS</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td></tr>
                : patients.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No patients found</td></tr>
                  : patients.map(p => (
                      <tr key={`${p.subject_id}-${p.hadm_id}`} onClick={() => navigate(`/patients/${p.subject_id}`)}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--teal)' }}>{p.subject_id}</td>
                        <td>{p.gender === 'M' ? '♂ Male' : p.gender === 'F' ? '♀ Female' : p.gender}</td>
                        <td>{p.age ? Math.round(p.age) : '—'}</td>
                        <td><span style={{ fontSize: 12, background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>{p.admission_type}</span></td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{p.diagnosis || '—'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.first_careunit || '—'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.icu_los ? `${p.icu_los.toFixed(1)}d` : '—'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.risk_score ? p.risk_score.toFixed(0) : '—'}</td>
                        <td>{p.risk_level ? <RiskBadge level={p.risk_level} /> : '—'}</td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Page {page} of {pages} · {total.toLocaleString()} total
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
