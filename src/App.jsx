
import { useState, useEffect } from 'react'
import api from './services/api'
import './App.css'

const objectConfig = {
  Account: {
    endpoint: '/api/salesforce/accounts',
    fields: ['Name', 'Type', 'Industry', 'Phone', 'Website'],
    formFields: [
      { key: 'name', label: 'Account Name', type: 'text' },
      {
        key: 'type',
        label: 'Account Type',
        options: [
          'Customer - Direct',
          'Customer - Channel',
          'Prospect',
          'Partner',
          'Other',
        ],
      },
      {
        key: 'industry',
        label: 'Industry',
        options: [
          'Technology',
          'Electronics',
          'Education',
          'Consulting',
          'Construction',
          'Other',
        ],
      },
    ],
    emptyForm: {
      name: '',
      type: 'Customer - Direct',
      industry: 'Technology',
    },
    toForm: (record) => ({
      name: record.Name || '',
      type: record.Type || 'Customer - Direct',
      industry: record.Industry || 'Technology',
    }),
  },

  Opportunity: {
    endpoint: '/api/salesforce/opportunities',
    fields: ['Name', 'StageName', 'CloseDate', 'Amount', 'Probability'],
    formFields: [
      { key: 'name', label: 'Opportunity Name', type: 'text' },
      {
        key: 'stageName',
        label: 'Stage',
        options: [
          'Prospecting',
          'Qualification',
          'Needs Analysis',
          'Value Proposition',
          'Id. Decision Makers',
          'Perception Analysis',
          'Proposal/Price Quote',
          'Negotiation/Review',
          'Closed Won',
          'Closed Lost',
        ],
      },
      { key: 'closeDate', label: 'Close Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'number' },
    ],
    emptyForm: {
      name: '',
      stageName: 'Prospecting',
      closeDate: '',
      amount: '',
    },
    toForm: (record) => ({
      name: record.Name || '',
      stageName: record.StageName || 'Prospecting',
      closeDate: record.CloseDate || '',
      amount: record.Amount ?? '',
    }),
  },

  Lead: {
    endpoint: '/api/salesforce/leads',
    fields: ['FirstName', 'LastName', 'Company', 'Status', 'Email'],
    formFields: [
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        required: false,
      },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      {
        key: 'status',
        label: 'Status',
        options: [
          'Open - Not Contacted',
          'Working - Contacted',
          'Closed - Converted',
          'Closed - Not Converted',
        ],
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: false,
      },
    ],
    emptyForm: {
      firstName: '',
      lastName: '',
      company: '',
      status: 'Open - Not Contacted',
      email: '',
    },
    toForm: (record) => ({
      firstName: record.FirstName || '',
      lastName: record.LastName || '',
      company: record.Company || '',
      status: record.Status || 'Open - Not Contacted',
      email: record.Email || '',
    }),
  },

  Contact: {
    endpoint: '/api/salesforce/contacts',
    fields: ['FirstName', 'LastName', 'AccountId', 'Email', 'Phone'],
    formFields: [
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        required: false,
      },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      {
        key: 'accountId',
        label: 'Account ID',
        type: 'text',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: false,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'tel',
        required: false,
      },
    ],
    emptyForm: {
      firstName: '',
      lastName: '',
      accountId: '',
      email: '',
      phone: '',
    },
    toForm: (record) => ({
      firstName: record.FirstName || '',
      lastName: record.LastName || '',
      accountId: record.AccountId || '',
      email: record.Email || '',
      phone: record.Phone || '',
    }),
  },

  Case: {
    endpoint: '/api/salesforce/cases',
    fields: ['CaseNumber', 'Subject', 'Status', 'Priority', 'Origin'],
    formFields: [
      { key: 'subject', label: 'Subject', type: 'text' },
      {
        key: 'status',
        label: 'Status',
        options: ['New', 'Working', 'Escalated', 'Closed'],
      },
      {
        key: 'priority',
        label: 'Priority',
        options: ['High', 'Medium', 'Low'],
      },
      {
        key: 'origin',
        label: 'Origin',
        options: ['Phone', 'Email', 'Web'],
      },
    ],
    emptyForm: {
      subject: '',
      status: 'New',
      priority: 'Medium',
      origin: 'Web',
    },
    toForm: (record) => ({
      subject: record.Subject || '',
      status: record.Status || 'New',
      priority: record.Priority || 'Medium',
      origin: record.Origin || 'Web',
    }),
    toApiPayload: (form) => ({
      Subject: form.subject,
      Status: form.status,
      Priority: form.priority,
      Origin: form.origin,
    }),
  },
}

function App() {
  const [selectedObject, setSelectedObject] = useState('Account')
  const [records, setRecords] = useState([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formMode, setFormMode] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [viewingRecord, setViewingRecord] = useState(null)
  const [formData, setFormData] = useState({
    ...objectConfig.Account.emptyForm,
  })

  const config = objectConfig[selectedObject]

  useEffect(() => {
    setFormMode('')
    setEditingId(null)
    setFormData({ ...objectConfig[selectedObject].emptyForm })
    fetchRecords()
  }, [selectedObject])

  async function fetchRecords() {
    setLoading(true)
    setError('')
    setOffset(0)
    setHasMore(true)

    try {
      const response = await api.get(objectConfig[selectedObject].endpoint, {
        params: { offset: 0 },
      })

      const batch = response.data.records || []
      setRecords(batch)
      setOffset(batch.length)
      setHasMore(batch.length === 20)
    } catch (err) {
      setRecords([])
      setHasMore(false)
      setError(
        err.response?.status === 401
          ? 'Please log in with Salesforce first.'
          : 'Could not load records. Check Salesforce login and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    if (loading || loadingMore || !hasMore) return

    setLoadingMore(true)
    setError('')

    try {
      const response = await api.get(config.endpoint, {
        params: { offset },
      })

      const batch = response.data.records || []

      setRecords((previousRecords) => [
        ...previousRecords,
        ...batch,
      ])
      setOffset((previousOffset) => previousOffset + batch.length)
      setHasMore(batch.length === 20)
    } catch (err) {
      setError(
        'Could not load more records. Please try scrolling again.',
      )
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    function handleScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 250

      if (nearBottom) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [selectedObject, offset, loading, loadingMore, hasMore])

  function openCreateForm() {
    setMessage('')
    setError('')
    setEditingId(null)
    setFormData({ ...config.emptyForm })
    setFormMode('create')
  }

  function openEditForm(record) {
    setMessage('')
    setError('')
    setEditingId(record.Id)
    setFormData(config.toForm(record))
    setFormMode('edit')
  }

  function closeForm() {
    setFormMode('')
    setEditingId(null)
    setFormData({ ...config.emptyForm })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const isCase = selectedObject === 'Case'
      const endpoint = config.endpoint

      if (isCase) {
        const payload = config.toApiPayload(formData)

        if (formMode === 'create') {
          await api.post(endpoint, payload)
        } else {
          await api.patch(`${endpoint}/${editingId}`, payload)
        }
      } else {
        if (formMode === 'create') {
          await api.post(endpoint, null, {
            params: formData,
          })
        } else {
          await api.patch(`${endpoint}/${editingId}`, null, {
            params: formData,
          })
        }
      }

      setMessage(
        `${selectedObject} ${
          formMode === 'create' ? 'created' : 'updated'
        } successfully!`,
      )

      closeForm()
      await fetchRecords()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to save ${selectedObject}. Check the field values and Salesforce permissions.`,
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(record) {
    const displayName =
      record.Name ||
      [record.FirstName, record.LastName].filter(Boolean).join(' ') ||
      record.Subject ||
      record.CaseNumber ||
      record.Id

    const confirmed = window.confirm(
      `Are you sure you want to delete "${displayName}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await api.delete(`${config.endpoint}/${record.Id}`)
      setMessage(`${selectedObject} deleted successfully!`)
      await fetchRecords()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to delete ${selectedObject}. Check Salesforce permissions and try again.`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Salesforce CRUD</h1>
          <p>Manage your Salesforce records in one place</p>
        </div>

        <button
          className="login-button"
          onClick={() => {
            window.location.href = 'http://localhost:8080/oauth/login'
          }}
        >
          Login with Salesforce
        </button>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h2>Salesforce Data Manager</h2>
          <p>Select an object to view and manage its records.</p>
        </section>

        <section className="toolbar">
          <div className="select-group">
            <label htmlFor="object-select">
              Select Salesforce Object
            </label>

            <select
              id="object-select"
              value={selectedObject}
              onChange={(event) => {
                setSelectedObject(event.target.value)
                setMessage('')
                setError('')
              }}
            >
              {Object.keys(objectConfig).map((object) => (
                <option key={object} value={object}>
                  {object}
                </option>
              ))}
            </select>
          </div>

          <button
            className="create-button"
            disabled={loading}
            onClick={openCreateForm}
          >
            + Create {selectedObject}
          </button>
        </section>

        {formMode && (
          <section className="records-section create-form-section">
            <h3>
              {formMode === 'create' ? 'Create' : 'Edit'}{' '}
              {selectedObject}
            </h3>

            <form onSubmit={handleSubmit}>
              {config.formFields.map((field) => (
                <div key={field.key}>
                  <label htmlFor={field.key}>{field.label}</label>

                  {field.options ? (
                    <select
                      id={field.key}
                      value={formData[field.key] ?? ''}
                      required={field.required !== false}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          [field.key]: event.target.value,
                        })
                      }
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type || 'text'}
                      value={formData[field.key] ?? ''}
                      required={field.required !== false}
                      min={
                        field.type === 'number' ? '0' : undefined
                      }
                      step={
                        field.type === 'number' ? 'any' : undefined
                      }
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          [field.key]: event.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}

              <div className="form-actions">
                <button
                  type="submit"
                  className="create-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Saving...'
                    : formMode === 'create'
                      ? `Save ${selectedObject}`
                      : 'Save Changes'}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="records-section">
          <div className="records-heading">
            <div>
              <h3>{selectedObject} Records</h3>
              <p>Records retrieved from Salesforce</p>
            </div>

            <span className="record-count">
              {records.length} loaded
            </span>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          {loading && <p className="message">Loading records...</p>}

          {!loading && !error && records.length > 0 && (
            <div className="table-container">
              <table className="records-table">
                <thead>
                  <tr>
                    {config.fields.map((field) => (
                      <th key={field}>{field}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.Id}>
                      {config.fields.map((field) => (
                        <td key={field}>
                          {record[field] ?? '—'}
                        </td>
                      ))}

                      <td>
                        <button
                          type="button"
                          onClick={() => setViewingRecord(record)}
                          disabled={loading}
                          >
                          View
                        </button>{' '}
                        <button
                          type="button"
                          onClick={() => openEditForm(record)}
                          disabled={loading}
                        >
                          Edit
                        </button>{' '}

                        <button
                          type="button"
                          onClick={() => handleDelete(record)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loadingMore && (
            <p className="message">Loading more records...</p>
          )}

          {!loadingMore && !hasMore && records.length > 0 && (
            <p className="message">You've reached the end of the records.</p>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="empty-state">
              <h3>No records found</h3>
              <p>
                There are no records to display for this object.
              </p>
            </div>
          )}
          {viewingRecord && (
  <div className="view-modal-overlay">
    <div
      className="view-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
    >
      <h3 id="view-modal-title">
        {selectedObject} Details
      </h3>

      <div className="view-record-details">
        {Object.entries(viewingRecord).map(([key, value]) => (
          <div className="view-record-row" key={key}>
            <strong>{key}</strong>
            <span>
              {value === null || value === undefined || value === ''
                ? '—'
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="cancel-button"
        onClick={() => setViewingRecord(null)}
      >
        Close
      </button>
    </div>
  </div>
)}
        </section>
      </main>
    </div>
  )
}

export default App
