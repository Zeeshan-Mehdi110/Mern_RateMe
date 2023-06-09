import {
  Avatar,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loadDepartments } from '../../store/actions/departmentActions'
import { connect } from 'react-redux'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteDepartment from './DeleteDepartment'

function Departments({ departments, loadDepartments }) {
  useEffect(() => {
    if (departments.length === 0) loadDepartments()
  }, [])
  return (
    <Box overflow={"auto"} >
      <Box display="flex" justifyContent="space-between">
        <Typography fontSize={{ xs: "15px", md: "24px" }} fontWeight="bold" fontFamily="Josefin Sans" >Departments</Typography>
        <Box>
          <Button
            component={Link}
            to="/admin/departments/add"
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ fontSize: { xs: "10px", md: "16px" } }}
          >
            {' '}
            Add
          </Button>
          <Button
            sx={{ ml: 1, fontSize: { xs: "10px", md: "16px" } }}
            onClick={loadDepartments}
            variant="outlined"
            endIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept._id}>
                <TableCell>
                  {dept.logo && (
                    <Avatar sx={{ "width": "32px", "height": "32px" }} alt="L" src={dept?.logo} />
                  )}
                </TableCell>
                <TableCell>
                  <Link to={`/admin/employees/${dept._id}`} >
                    {dept.name}
                  </Link>
                </TableCell>
                <TableCell>{dept.phone}</TableCell>
                <TableCell>{dept.email}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/admin/departments/edit/${dept._id}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <DeleteDepartment departmentId={dept._id} name={dept.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

const mapStateToProps = (state) => {
  return {
    departments: state.departments.records
  }
}

export default connect(mapStateToProps, { loadDepartments })(Departments)
