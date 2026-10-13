
import { useState, useEffect } from 'react'
import api from './services/api'
import './App.css'

const objectConfig = {
  Account: {
    endpoint: '/api/salesforce/accounts',
    fields: ['Name', 'Type', 'Industry'],
  },
  Opportunity: {
    endpoint: '/api/salesforce/opportunities',
    fields: ['Name', 'StageName', 'CloseDate', 'Amount'],
  },
  Lead: {
    endpoint: '/api/salesforce/leads',
    fields: ['FirstName', 'LastName', 'Company', 'Status', 'Email'],
  },
  Contact: {
    endpoint: '/api/salesforce/contacts',
    fields: ['FirstName', 'LastName', 'AccountId', 'Email', 'Phone'],
  },
  Case: {
    endpoint: '/api/salesforce/cases',
    fields: ['CaseNumber', 'Subject', 'Status', 'Priority', 'Origin'],
  },
}

function App() {
  const [selectedObject, setSelectedObject] = useState('Account')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Customer - Direct',
    industry: 'Technology',
  })

  useEffect(() => {
    fetchRecords()
  }, [selectedObject])

  async function fetchRecords() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get(
        objectConfig[selectedObject].endpoint
      )
      setRecords(response.data.records || [])
    } catch (err) {
      setRecords([])
      setError(
        err.response?.status === 401
          ? 'Please log in with Salesforce first.'
          : 'Could not load records. Please log in and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleCreateClick() {
    if (selectedObject !== 'Account') {
      alert('For now, Create is available for Account only.')
      return
    }

    setFormData({
      name: '',
      type: 'Customer - Direct',
      industry: 'Technology',
    })

    setShowCreateForm(true)
  }

  function handleFormChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  
async function handleCreateSubmit(event) {
  event.preventDefault()
  setError('')

  try {
    await api.post(
      '/api/salesforce/accounts',
      null,
      {
        params: {
          name: formData.name,
          type: formData.type,
          industry: formData.industry,
        },
      }
    )

    setShowCreateForm(false)
    await fetchRecords()

    alert('Account created successfully!')
  } catch (err) {
    console.error('Create account error:', err.response?.data || err)

    setError(
      err.response?.data?.message ||
      'Failed to create account. Please check your Salesforce login and try again.'
    )
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
            window.location.href =
              'http://localhost:8080/oauth/login'
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
                setShowCreateForm(false)
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
            onClick={handleCreateClick}
          >
            + Create {selectedObject}
          </button>
        </section>

        {showCreateForm && selectedObject === 'Account' && (
          <section className="records-section create-form-section">
            <h3>Create Account</h3>

            <form onSubmit={handleCreateSubmit}>
              <label htmlFor="account-name">Account Name</label>
              <input
                id="account-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter account name"
                required
              />

              <label htmlFor="account-type">Account Type</label>
              <select
                id="account-type"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
              >
                <option value="Customer - Direct">
                  Customer - Direct
                </option>
                <option value="Customer - Channel">
                  Customer - Channel
                </option>
                <option value="Prospect">Prospect</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="account-industry">Industry</label>
              <select
                id="account-industry"
                name="industry"
                value={formData.industry}
                onChange={handleFormChange}
              >
                <option value="Technology">Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Education">Education</option>
                <option value="Consulting">Consulting</option>
                <option value="Construction">Construction</option>
                <option value="Other">Other</option>
              </select>

              <div className="form-actions">
                <button type="submit" className="create-button">
                  Save Account
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowCreateForm(false)}
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
              {records.length} records
            </span>
          </div>

          {loading && (
            <p className="message">Loading records...</p>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchRecords}>Try again</button>
            </div>
          )}

          {!loading && !error && records.length > 0 && (
            <div className="table-container">
              <table className="records-table">
                <thead>
                  <tr>
                    {objectConfig[selectedObject].fields.map(
                      (field) => (
                        <th key={field}>{field}</th>
                      )
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.Id}>
                      {objectConfig[selectedObject].fields.map(
                        (field) => (
                          <td key={field}>
                            {record[field] ?? '—'}
                          </td>
                        )
                      )}
                      <td>View · Edit · Delete</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="empty-state">
              <h3>No records found</h3>
              <p>
                There are no records to display for this object.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
