```
import { useState, useCallback } from 'react'

const formFields = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'password', label: 'Password', type: 'radio' },
  {
    key: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' }
    ]
  }
]

const formData = {
  name: 'shoaib',
  age: '',
  password: '',
  gender: '',
  city: '',
  address: ''
}

const Field = ({ field, value, onChange }) => {
  const { key, label, type, options, ...rest } = field

  const handleChange = (e) => {
    const newValue = type === 'checkbox' ? e.target.checked : e.target.value
    onChange(key, newValue)
  }

  switch (type) {
    case 'select':
      return (
        <div className="form-field">
          <label htmlFor={key}>{label}</label>
          <select id={key} value={value || ''} onChange={handleChange} {...rest}>
            <option value="">Select an option</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )
    
    case 'textarea':
      return (
        <div className="form-field">
          <label htmlFor={key}>{label}</label>
          <textarea id={key} value={value || ''} onChange={handleChange} {...rest} />
        </div>
      )
    
    case 'checkbox':
    case 'radio':
      return (
        <div className="form-field">
          <label htmlFor={key}>
            <input
              type={type}
              id={key}
              checked={!!value}
              onChange={handleChange}
              {...rest}
            />
            {label}
          </label>
        </div>
      )
    
    default:
      return (
        <div className="form-field">
          <label htmlFor={key}>{label}</label>
          <input
            type={type || 'text'}
            id={key}
            value={type === 'number' ? (value === undefined || value === null ? '' : String(value)) : value || ''}
            onChange={handleChange}
            {...rest}
          />
        </div>
      )
  }
}

export const Form = ({ form, formData, onChange }) => {
  const handleFieldChange = useCallback(
    (key, value) => {
      onChange?.({ ...formData, [key]: value })
    },
    [formData, onChange]
  )

  const renderSection = (section, index) => (
    <div key={section.title || `section-${index}`} className="form-section">
      {section.title && <h2>{section.title}</h2>}
      {section.fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          value={formData[field.key] || ''}
          onChange={handleFieldChange}
        />
      ))}
    </div>
  )

  return (
    <form className="form-container">
      {Array.isArray(form) ? (
        form.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={formData[field.key] || ''}
            onChange={handleFieldChange}
          />
        ))
      ) : (
        form.sections?.map(renderSection)
      )}
    </form>
  )
}


```


```
import { useState } from 'react'
import { Form } from './components/Form'

// Moved from Form.jsx:
const formWithSections = {
  sections: [
    {
      title: 'section (1)',
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'age', label: 'Age', type: 'number', value: '5' },
        { key: 'password', label: 'Password', type: 'password' },
        {
          key: 'gender',
          label: 'Gender',
          type: 'select',
          options: [
            { value: 'male', text: 'Male' },
            { value: 'female', text: 'Female' }
          ]
        }
      ]
    },
    {
      title: 'section (2)',
      fields: [
        { key: 'city', label: 'City', type: 'text' },
        { key: 'address', label: 'Address', type: 'textarea' },
      ]
    },
    // ...other sections maintain the same structure
  ]
}

const initialFormData = {
  name: 'shoaib',
  age: '',
  password: '',
  gender: '',
  city: '',
  address: ''
}

function App() {
  const [count, setCount] = useState(0)
  const [formData, setFormData] = useState(initialFormData)

  const handleFormChange = (data) => {
    setFormData(data)
    console.log(data)
  }

  return (
    <div className="">
      <br />
      <Form
        form={formWithSections}
        formData={formData}
        onChange={handleFormChange}
      />
    </div>
  )
}

export default App
```