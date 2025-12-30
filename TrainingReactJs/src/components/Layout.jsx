import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { markAllAsRead, setNotifications } from '../store/slices/notificationSlice'
import { useState, useEffect } from 'react'
import { notificationApi } from '../services/mockApi'
import Sidebar from './Sidebar'

const Layout = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications
  )
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const loadNotifications = async () => {
    try {
      const notifs = await notificationApi.getNotifications(user.id)
      dispatch(setNotifications(notifs))
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead())
    handleNotificationClose()
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      trainer: 'Trainer',
      trainee: 'Trainee',
      client: 'Client',
      admin: 'Admin',
    }
    return roleMap[role] || role
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin 0.3s',
          marginLeft: sidebarOpen ? '280px' : 0,
          width: sidebarOpen ? 'calc(100% - 280px)' : '100%',
          [theme.breakpoints.down('md')]: {
            marginLeft: 0,
            width: '100%',
          },
        }}
      >
        <AppBar
          position="static"
          sx={{
            backgroundColor: '#1E1E1E',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                fontSize: '1.25rem',
              }}
            >
              {getRoleDisplayName(user?.role)} Dashboard
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              backgroundColor: '#1E1E1E',
              minWidth: 300,
            },
          }}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>No notifications</MenuItem>
          ) : (
            <>
              {notifications.slice(0, 5).map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={handleNotificationClose}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notif.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              {notifications.length > 5 && (
                <MenuItem
                  onClick={handleNotificationClose}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                    },
                  }}
                >
                  View all notifications
                </MenuItem>
              )}
              {unreadCount > 0 && (
                <MenuItem
                  onClick={handleMarkAllRead}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(100, 181, 246, 0.1)',
                    },
                  }}
                >
                  Mark all as read
                </MenuItem>
              )}
            </>
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: '#1E1E1E',
              minWidth: 200,
            },
          }}
        >
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {user?.name}
            </Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
              },
            }}
          >
            <Logout sx={{ mr: 1 }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            backgroundColor: '#121212',
            minHeight: 'calc(100vh - 64px)',
            width: '100%',
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              maxWidth: '100%',
              width: '100%',
              p: 3,
              mx: 'auto',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
