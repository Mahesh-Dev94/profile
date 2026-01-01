import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
} from '@mui/material'
import {
  Dashboard,
  CalendarToday,
  History,
  Person,
  Group,
  Notifications,
  Settings,
  Add,
  CheckCircle,
  Cancel,
  Schedule,
  Business,
  School,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'

const drawerWidth = 280

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [expandedMenus, setExpandedMenus] = useState({})

  const handleMenuClick = (path) => {
    navigate(path)
    if (window.innerWidth < 960) {
      onClose()
    }
  }

  const handleExpandClick = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const getMenuItems = () => {
    const role = user?.role

    if (role === 'trainer') {
      return [
        {
          title: 'Dashboard',
          icon: <Dashboard />,
          path: '/trainer',
          exact: true,
        },
        {
          title: 'Availability',
          icon: <CalendarToday />,
          children: [
            { title: 'Manage Availability', path: '/trainer/availability' },
            { title: 'View Schedule', path: '/trainer/schedule' },
          ],
        },
        {
          title: 'Training Requests',
          icon: <Notifications />,
          path: '/trainer/requests',
        },
        {
          title: 'My Trainings',
          icon: <Schedule />,
          children: [
            { title: 'Upcoming', path: '/trainer/trainings/upcoming' },
            { title: 'In Progress', path: '/trainer/trainings/in-progress' },
            { title: 'Completed', path: '/trainer/trainings/completed' },
            { title: 'Cancelled', path: '/trainer/trainings/cancelled' },
          ],
        },
        {
          title: 'Training History',
          icon: <History />,
          path: '/trainer/history',
        },
      ]
    }

    if (role === 'client') {
      return [
        {
          title: 'Dashboard',
          icon: <Dashboard />,
          path: '/client',
          exact: true,
        },
        {
          title: 'Request Training',
          icon: <Add />,
          path: '/client/request',
        },
        {
          title: 'Training Requests',
          icon: <Business />,
          children: [
            { title: 'Active Request', path: '/client/requests/pending' },
            { title: 'Approved', path: '/client/requests/approved' },
            { title: 'Rejected', path: '/client/requests/rejected' },
            { title: 'Rescheduled', path: '/client/requests/rescheduled' },
          ],
        },
        {
          title: 'Training History',
          icon: <History />,
          path: '/client/history',
        },
        {
          title: 'Invoices',
          icon: <Business />,
          path: '/client/invoices',
        },
      ]
    }

    if (role === 'admin') {
      return [
        {
          title: 'Dashboard',
          icon: <Dashboard />,
          path: '/admin',
          exact: true,
        },
        {
          title: 'Scheduling',
          icon: <CalendarToday />,
          children: [
            { title: 'All Trainings', path: '/admin/trainings' },
            { title: 'Conflicts', path: '/admin/conflicts' },
            { title: 'Requests', path: '/admin/requests' },
          ],
        },
        {
          title: 'User Management',
          icon: <Group />,
          children: [
            { title: 'Trainers', path: '/admin/trainers' },
            { title: 'Clients', path: '/admin/clients' },
            { title: 'Create User', path: '/admin/users/create' },
          ],
        },
        {
          title: 'Client Priority',
          icon: <Settings />,
          path: '/admin/priority',
        },
        {
          title: 'System Logs',
          icon: <History />,
          path: '/admin/logs',
        },
      ]
    }

    return []
  }

  const renderMenuItem = (item, level = 0) => {
    if (item.children) {
      const isExpanded = expandedMenus[item.title]
      return (
        <Box key={item.title}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleExpandClick(item.title)}
              sx={{
                pl: 2 + level * 2,
                '&:hover': {
                  backgroundColor: 'rgba(100, 181, 246, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        </Box>
      )
    }

    const active = isActive(item.path)

    return (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          onClick={() => handleMenuClick(item.path)}
          selected={active}
          sx={{
            pl: 2 + level * 2,
            backgroundColor: active ? 'rgba(100, 181, 246, 0.15)' : 'transparent',
            borderLeft: active ? '3px solid' : 'none',
            borderColor: active ? 'primary.main' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(100, 181, 246, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(100, 181, 246, 0.15)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: active ? 'primary.main' : 'text.secondary',
              minWidth: 40,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '0.95rem',
              fontWeight: active ? 600 : 500,
              color: active ? 'primary.main' : 'text.primary',
            }}
          />
        </ListItemButton>
      </ListItem>
    )
  }

  const menuItems = getMenuItems()

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1E1E1E',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          backgroundColor: '#121212',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(45deg, #64B5F6 30%, #CE93D8 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Life Labs Training Platform
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.name || 'User'}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Drawer>
  )
}

export default Sidebar

