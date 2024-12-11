import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    const {url} = useContext(StoreContext);
    const navigate = useNavigate();

   /* const verifyPayment = async () => {
        const response = await axios.post(url+"/api/order/verify",{success,orderId});
        console.log(response.data);
        if (response.data.success) {
           navigate("/myoredrs"); 
        }
        else{
            navigate("/");
        }
    }*/
    const verifyPayment = async () => {
        try {
            // console.log("Verifying payment with:", { success, orderId }); 
    
            const response = await axios.post(`${url}/api/order/verify?orderId=${orderId}&success=${success}`);
    
            // console.log("Backend response:", response.data); 
    
            if (response.data.success) {
                navigate("/myorders");  
            } else {
                navigate("/");  
            }
        } catch (error) {
            console.error("Error during payment verification:", error);
            navigate("/");  // Redirect to home on error
        }
    };
        
    

    useEffect(()=>{
        verifyPayment();
    },[])

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  )
}

export default Verify
