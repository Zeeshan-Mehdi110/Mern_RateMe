import { useEffect } from 'react'
import AppPublic from './AppPublic'
import { loadAuth, signOut } from './store/actions/authActions'
import { connect } from 'react-redux'
import AppPreLoader from './components/library/AppPreLoader'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppBar from './components/AppBar'
import { Container } from '@mui/system'
import AccountSettings from './components/AccountSettings'
import Dashboard from './components/Dashboard'
import AlertMessage from './components/library/AlertMessage'
import BlockInterface from './components/library/BlockInterface'
import AddDepartment from './components/departments/AddDepartment'
import EditDepartment from './components/departments/EditDepartment'
import Departments from './components/departments/Departments'
import AddUser from './components/users/AddUser'
import Users from './components/users/Users'
import EditUser from './components/users/EditUser'
import { userTypes } from './utils/constants'
import loader from "./static/loader.gif"
import Employees from './components/employees/Employees'
import AddEmployees from './components/employees/AddEmployees'
import EditEmployee from './components/employees/EditEmployee'
import EmployeeProfile from "./components/employees/EmployeeProfile";
import NoFound404 from './components/library/NoFound404'

const publicRoutes = [
  '/admin/signin',
  '/admin/forgot-password',
  '/admin/reset-password/'
]
const feedbackRouts = ['/', '/employee/feedback']

function App({ user, isAuthLoaded, loadAuth, userType }) {
  const location = useLocation()
  useEffect(() => {
    loadAuth()
  }, [])

  if (!isAuthLoaded) return <AppPreLoader loader={loader} />

  if (user) {
    if (user && publicRoutes.find(url => location.pathname.startsWith(url)))
      return <Navigate to="/admin/dashboard" />
    if (location.pathname === '/' || location.pathname.startsWith('/employee/feedback'))
      return <Navigate to='/admin/dashboard' />
  } else {
    if (!publicRoutes.find(url => location.pathname.startsWith(url)) && location.pathname !== '/' && !location.pathname.startsWith('/employee/feedback'))
      return <Navigate to='/' />
  }

  if (!user) return <AppPublic />

  return (
    <>
      <AppBar />
      <AlertMessage />
      <Container
        sx={{
          mt: 10,
          p: { xs: 2, md: 3 },
          backgroundColor: '#fff',
          borderRadius: '5px',
          boxShadow: '0px 0px 17px 5px #dbdada',
          position: 'relative'
        }}
      >
        <BlockInterface />
        <Routes>
          <Route path="/admin/account-settings" Component={AccountSettings} />
          <Route path="/admin/dashboard" Component={Dashboard} />
          {/* Departments routes */}
          {userType === userTypes.USER_TYPE_SUPER && (
            <>
              <Route path="/admin/departments" Component={Departments} />
              <Route path="/admin/departments/add" Component={AddDepartment} />
            </>
          )}
          <Route
            path="/admin/departments/edit/:deptId"
            Component={EditDepartment}
          />
          {/* Users routes */}
          <Route path="/admin/users" Component={Users} />
          <Route path="/admin/users/add" Component={AddUser} />
          <Route path="/admin/users/edit/:userId" Component={EditUser} />

          <Route path="/admin/employees/:deptId" Component={Employees} />
          <Route path="/admin/employees/add/:deptId" Component={AddEmployees} />
          <Route path="/admin/employees/edit/:employeeId" Component={EditEmployee} />
          <Route path="/admin/employees/profile/:employeeId" Component={EmployeeProfile} />
          <Route path='*' Component={NoFound404} />
        </Routes>
      </Container>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    isAuthLoaded: state.auth.isLoaded,
    userType: state.auth.userType
  }
}

export default connect(mapStateToProps, { loadAuth, signOut })(App)
