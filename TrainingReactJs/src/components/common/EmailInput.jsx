import { useState, useRef, useEffect } from 'react'
import {
  TextField,
  Box,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from '@mui/material'
import { getTraineeCounts } from '../../services/mockApi'
import initialData from '../../data/initialData.json'

const EmailInput = ({ value = '', onChange, label = 'Email ID', required = false, error, helperText }) => {
  const [emails, setEmails] = useState(value ? value.split(',').map(e => e.trim()).filter(Boolean) : [])
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const sampleEmails = initialData.sampleEmails || []

  useEffect(() => {
    if (value) {
      const emailList = value.split(',').map(e => e.trim()).filter(Boolean)
      setEmails(emailList)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)

    if (val.includes(',')) {
      const newEmails = val.split(',').map(e => e.trim()).filter(Boolean)
      newEmails.forEach(email => {
        if (isValidEmail(email) && !emails.includes(email)) {
          setEmails([...emails, email])
        }
      })
      setInputValue('')
      setShowSuggestions(false)
    } else if (val.length > 0) {
      const filtered = sampleEmails.filter(email =>
        email.toLowerCase().includes(val.toLowerCase()) &&
        !emails.includes(email)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      const email = inputValue.trim()
      if (isValidEmail(email) && !emails.includes(email)) {
        addEmail(email)
      }
    } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      removeEmail(emails.length - 1)
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const addEmail = (email) => {
    if (isValidEmail(email) && !emails.includes(email)) {
      const newEmails = [...emails, email]
      setEmails(newEmails)
      onChange(newEmails.join(', '))
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index)
    setEmails(newEmails)
    onChange(newEmails.join(', '))
  }

  const handleSuggestionClick = (email) => {
    addEmail(email)
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          minHeight: '56px',
          padding: '14px 14px 0 14px',
          border: error ? '1px solid #d32f2f' : '1px solid rgba(255, 255, 255, 0.23)',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          '&:hover': {
            borderColor: error ? '#d32f2f' : 'rgba(255, 255, 255, 0.87)',
          },
          '&:focus-within': {
            borderColor: error ? '#d32f2f' : '#64B5F6',
            borderWidth: '2px',
          },
        }}
      >
        {emails.map((email, index) => (
          <Chip
            key={index}
            label={email}
            onDelete={() => removeEmail(index)}
            size="small"
            sx={{
              height: '28px',
              backgroundColor: 'rgba(100, 181, 246, 0.2)',
              color: '#64B5F6',
              '& .MuiChip-deleteIcon': {
                color: '#64B5F6',
                '&:hover': {
                  color: '#42A5F5',
                },
              },
            }}
          />
        ))}
        <TextField
          inputRef={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={emails.length === 0 ? 'Enter email addresses...' : ''}
          variant="standard"
          required={required && emails.length === 0}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.875rem',
              minWidth: emails.length === 0 ? '200px' : '100px',
              flex: 1,
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              padding: 0,
            },
          }}
        />
      </Box>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0.5,
            maxHeight: 200,
            overflow: 'auto',
            backgroundColor: '#1E1E1E',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <List dense>
            {filteredSuggestions.map((email, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleSuggestionClick(email)}>
                  <Typography variant="body2">{email}</Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            ml: 1.75,
            color: error ? '#d32f2f' : 'text.secondary',
          }}
        >
          {helperText}
        </Typography>
      )}
      {error && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            ml: 1.75,
            color: '#d32f2f',
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default EmailInput

