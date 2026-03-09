import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'

const DataTable = ({ columns, data, actions = [] }) => {
  return (
    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650, width: '100%' }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{ minWidth: column.minWidth || 'auto', fontWeight: 600 }}
              >
                {column.label}
              </TableCell>
            ))}
            {actions.length > 0 && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((column) => {
                  const value = row[column.id]
                  let displayValue = value

                  if (column.format) {
                    displayValue = column.format(value, row)
                  } else if (column.render) {
                    displayValue = column.render(value, row)
                  } else if (typeof value === 'boolean') {
                    displayValue = value ? 'Yes' : 'No'
                  }

                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{ minWidth: column.minWidth || 'auto' }}
                    >
                      {displayValue}
                    </TableCell>
                  )
                })}
                {actions.length > 0 && (
                  <TableCell align="right">
                    {actions.map((action, index) => (
                      <Tooltip key={index} title={action.tooltip || ''}>
                        <IconButton
                          size="small"
                          onClick={() => action.onClick(row)}
                          color={action.color || 'primary'}
                          disabled={action.disabled?.(row)}
                        >
                          {action.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DataTable

