import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {
    StyledButton,
    formVariants
} from '../../themes/componentsStyles';
import { Grid, Card, CardContent, Typography, IconButton, CardActions, FormControl } from '@mui/material';
import { createSale } from '../../services/salesService'
import { getProducts } from '../../services/productService';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import { isATokenValid } from '../../services/userService';
import { removeLocalStorage } from '../../utils';
const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const StyledCard = styled(Card)`
  &&.custom-card {
    border: 1px solid #f0e4ff;
    box-shadow: 0px 3px 2px rgba(77, 71, 71, 0.349);
    display: flex;
    flex-direction: row;
  }
`;
const StyledCardActions = styled(CardActions)`
  display: flex;
  margin-left: auto;
`;
const StyledContainer = styled(Box)`
  padding-top: 8vh;
  padding-block-end: 8vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledForm = styled(Box)`
  background-color: ${({ theme }) => theme.palette.background.paper}; 
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadows[3]};
  padding: ${({ theme }) => theme.spacing(4)};
`;

function CreateSale() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [productsList, setProductsList] = useState([]);
    var [totalCost, setTotalCost] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [cost, setCost] = useState(0);
    const [productsAdded, setProductsAdded] = useState([]);
    const [dateSelected, setDate] = React.useState(dayjs());
    const [clientName, setClientName] = useState('');

    const validationSchema = Yup.object().shape({
        // clientName: Yup.string().required('Client Name is required'),
        // date: Yup.date().required('Date is required'),
        //totalCost: Yup.number().required('Added products is required'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const [alert, setAlert] = useState({ type: 'success', message: null });

    const onSubmit = (data) => {
        const onSuccess = () => {
            setAlert({ type: 'success', message: 'Purchase created successfully' });
            setTimeout(() => {
                navigate('/home');
            }, 3000);
        };
        const onError = (error) => {
            setAlert({ type: 'error', message: `An error occurred: ${error} ` });
        };
        createSale(data, productsAdded, totalCost, dateSelected, onSuccess, onError);
    };
    
    useEffect(() => {
        const asyncFunction = async () =>{
            const tokenValid = await isATokenValid();
            if(!tokenValid){
                removeLocalStorage();
                navigate("/signIn");
            }
            else
                await fetchData();
        }
        asyncFunction();
    }, []);

    const handdleChangeAddProduct = (event, p) => {
        if (productsAdded.find(product => product.id === p.id)) {
            productsAdded.find(product => product.id === p.id).productQuantity = quantity;
            productsAdded.find(product => product.id === p.id).productCost = cost;
            productsAdded.find(product => product.id === p.id).productTotalCost = productsAdded.find(product => product.id === p.id).productQuantity * cost;
        } else {
            let newProduct = {
                id: p.id,
                name: p.name,
                productQuantity: quantity,
                productCost: cost,
                productTotalCost: quantity * cost
            }
            setProductsAdded([...productsAdded, newProduct]);
            setTotalCost(totalCost + newProduct.productTotalCost);
        }
    }

    const handdleChangeDeleteProduct = (event, p) => {
        setProductsAdded(productsAdded.filter(product => product.id !== p.id));
        setTotalCost(totalCost - p.productTotalCost);
    }

    const handleChangeQuantity = (event) => {
        setQuantity(event.target.value);
    };

    const handleChangeCost = (event) => {
        setCost(event.target.value);
    }

    async function fetchData() {
        const products = await getProducts();
        setProductsList(products.data);
    }

    function renderProduct() {
        return (<Grid container spacing={2}>
            {productsList.map((product) => {
                const {
                    id, name
                } = product;

                return (
                    <Grid item sx={{ width: '100%' }} key={product.id}>
                        <StyledCard className="custom-card">
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {product.name}
                                </Typography>
                                {product.description ? <Typography variant="body2" color="text.secondary">
                                    Description: {product.description}
                                </Typography> : null}
                            </CardContent>
                            <StyledCardActions>
                                <TextField
                                    margin="normal"
                                    id="productQuantity"
                                    label="Quantity"
                                    name="productQuantity"
                                    type="number"
                                    onChange={(event) => handleChangeQuantity(event)}
                                    autoFocus
                                />
                                <TextField
                                    margin="normal"
                                    id="productCost"
                                    label="Cost"
                                    name="productCost"
                                    type="number"
                                    onChange={(event) => handleChangeCost(event)}
                                    autoFocus
                                />
                            </StyledCardActions>
                            <IconButton size="medium" color="secondary" aria-label="add">
                                <AddIcon
                                    onClick={(event) => handdleChangeAddProduct(event, product)}
                                />
                            </IconButton>
                        </StyledCard>
                    </Grid>
                );
            })}
        </Grid>);
    }

    return (
        <StyledContainer  sx={{ m: 3, p: 2 }}>
            <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
                <StyledForm theme={theme} component="form" onSubmit={handleSubmit(onSubmit)} className="form">
                    <div style={{"paddingLeft": '1vh', "paddingTop": '1vh'}}>
                        <IconButton
                            size="medium"
                            color="inherit"
                            onClick={() => {navigate('/home')}}
                        >
                            <ArrowBackIosIcon fontSize='large' color='primary'  />
                        </IconButton>
                    </div>
                    <Typography component="h1" variant="h3" align="center" sx={{ mb: 2 }}> Register Sale </Typography>
                    <Grid container spacing={1}>
                        <Grid item sm={6} style={{ marginTop: "1.35%"}} >
                            <LocalizationProvider id="date" dateAdapter={AdapterDayjs} >
                                <DatePicker
                                    sx={{ width: '100%' }}
                                    id="date"
                                    label="Date"
                                    name="date"
                                    value={dateSelected}
                                    onChange={e =>  setDate(e)}
                                    error={!!errors.date}
                                    helperText={errors?.date?.message}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item sm={6}>
                            <TextField
                               margin="normal"
                               fullWidth
                               id="clientName"
                               label="Client Name"
                               name="clientName"
                               autoFocus
                               {...register('clientName')}
                               error={!!errors.clientName}
                               helperText={errors.clientName?.message}
                            />
                        </Grid>
                        <Grid item sm={12} >
                            <Typography component="h2" variant="h4"> Products </Typography>
                            {productsList.length ? (
                                renderProduct()
                            ) : (
                                <Typography variant="body1">There are no products, create some to add to your purchase</Typography>
                            )
                            }
                        </Grid>
                        <Grid item sm={12} >
                            <Typography component="h2" variant="h4" sx={{ mt: 2 }}> Products in my Sale </Typography>
                            <Accordion sx={{ width: '100%', mt: 1 }} >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>See your added products</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container item sm={12}>
                                        {productsAdded.length ? (
                                            <Grid container spacing={2}>
                                                {productsAdded.map((product) => {
                                                    const {
                                                        id, name, productQuantity, productCost, productTotalCost
                                                    } = product;

                                                    return (
                                                        <Grid item sx={{ width: '100%' }} key={product.id}>
                                                            <StyledCard className="custom-card"
                                                                id="productsSaled"
                                                                name="productsSaled"
                                                                label="productsSaled">
                                                                <CardContent>
                                                                    <Typography gutterBottom variant="h5" component="div">
                                                                        {product.name}
                                                                    </Typography>
                                                                    {product.description ? <Typography variant="body2" color="text.secondary">
                                                                        Description: {product.description}
                                                                    </Typography> : null}
                                                                </CardContent>
                                                                <StyledCardActions>
                                                                    <TextField
                                                                        margin="normal"
                                                                        id="productQuantity"
                                                                        label="Quantity"
                                                                        name="productQuantity"
                                                                        type="number"
                                                                        value={product.productQuantity}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                        }}
                                                                        autoFocus
                                                                    />
                                                                    <TextField
                                                                        margin="normal"
                                                                        id="productCost"
                                                                        label="Cost"
                                                                        name="productCost"
                                                                        type="number"
                                                                        value={product.productCost}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                        }}
                                                                        autoFocus
                                                                    />
                                                                    <TextField
                                                                        margin="normal"
                                                                        id="productTotalCost"
                                                                        label="Total Cost"
                                                                        name="productTotalCost"
                                                                        type="number"
                                                                        value={product.productTotalCost}
                                                                        InputProps={{
                                                                            readOnly: true,
                                                                        }}
                                                                        autoFocus
                                                                    />
                                                                </StyledCardActions>
                                                                <IconButton size="small" color="secondary" aria-label="add">
                                                                    <DeleteIcon
                                                                        onClick={(event) => handdleChangeDeleteProduct(event, product)}
                                                                    />
                                                                </IconButton>

                                                            </StyledCard>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        ) : (
                                            <Typography variant="body1">There are no products, create some to add to your sale</Typography>
                                        )
                                        }
                                    </Grid>
                                    <Grid container >
                                        <Typography style={{display: "flex", 'marginLeft': "auto", paddingRight: "5%", paddingTop: "2%"}} component="h4" variant="h5" align="right">Total Cost: {totalCost}</Typography>
                                    </Grid>

                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>
                    <StyledButton
                        theme={theme}
                        type='submit'
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        className="custom-button"
                    >
                        Create Purchase
                    </StyledButton>
                    {alert.message && (
                        <Alert severity={alert.type} sx={{ mt: 2 }}>
                            {alert.message}
                        </Alert>
                    )}
                </StyledForm>
            </motion.div>
        </StyledContainer>
    );
}
export default CreateSale;