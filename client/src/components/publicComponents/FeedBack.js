import { Avatar, Box, Button, Grid, Rating, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { Field, Form } from "react-final-form"
import { hideProgressBar, showProgressBar } from '../../store/actions/progressBarAction';
import { showError, showSuccess } from '../../store/actions/alertActions';
import ProgressBar from "../library/ProgressBar"
import TextInput from "../library/TextInput"
import RatingInput from "../library/RatingInput"
import AlertMessage from "../library/AlertMessage"
import Header from "../library/Header"

function Feedback() {
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const dispatch = useDispatch()
  const navigator = useNavigate()

  useEffect(() => {
    dispatch(showProgressBar())
    axios.get('/api/employees/publicDetails/' + employeeId).then((result) => {
      dispatch(hideProgressBar())
      if (result.data.employee)
        setEmployee(result.data.employee)
    }).catch(error => {
      let message = error && error.response && error.response.data ? error.response.data.error : error.message;
      dispatch(hideProgressBar())
      dispatch(showError(message))
    })
  }, [])

  const validate = (data) => {
    const errors = {};
    if (!data.rating) errors.rating = "Rating is required"
    if (!data.name) errors.name = "Name is required";
    return errors
  };

  const handleSumbmit = async (data, form) => {
    try {
      dispatch(showProgressBar())
      let result = await axios.post("api/employees/feedback", { employeeId, ...data });
      if (result.data.success) {
        dispatch(showSuccess('Feedback sent successfully'))
        navigator(`/`)
      }
      dispatch(hideProgressBar())

    } catch (error) {
      let message = error && error.response && error.response.data ? error.response.data.error : error.message;
      dispatch(hideProgressBar())
      dispatch(showError(message))
    }
  };

  return (
    <>
      <Header />
      <Box display={'flex'} mt={14} justifyContent={'center'} alignItems={"center"} height="100%" >
        <Box >
          <ProgressBar />
          <AlertMessage />
          {
            employee &&
            <Grid container spacing={4} display={"flex"} flexDirection={"row"}>
              <Grid item xs={12} md={8} mx="auto">
                <Avatar variant="square" sx={{ width: "100%", height: "90%", objectFit: "contain" }} src={employee.profilePicture} />
                <Typography sx={{ mt: 3, }} textAlign="center" variant="h5">{employee.name}</Typography>
              </Grid>
              <Grid item xs={12} md={8} mb={2} mx="auto">
                <Typography textAlign={"center"} gutterBottom variant="h6" >Give Feedback to {employee.name}</Typography>
                <Form
                  onSubmit={handleSumbmit}
                  validate={validate}
                  initialValues={{}}
                  render={({
                    handleSubmit,
                    submitting,
                    invalid,
                  }) => (
                    <form onSubmit={handleSubmit} method="post">
                      <Field component={RatingInput} name="rating" />
                      <Field component={TextInput} multiline rows={5} type='text' name="message" placeholder="Enter your message or feedback..." />
                      <Field component={TextInput} type='text' name="name" placeholder="Enter your name..." />
                      <Field component={TextInput} type='text' name="phone" placeholder="Enter phone number..." />
                      <Box textAlign="center">
                        <Button
                          sx={{ marginTop: '20px' }}
                          variant="outlined"
                          type="submit"
                          disabled={invalid || submitting}
                        >Submit FeedBack</Button>
                      </Box>
                    </form>
                  )}
                />
              </Grid>

            </Grid>
          }

        </Box>
      </Box>
    </>
  )
}
export default Feedback