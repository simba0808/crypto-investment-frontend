import React from 'react'
import Node from '../../components/user/Node';
import Avatar00 from '../../assets/avatar12.png';
import TaskBar from '../../components/user/TaskBar';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { setCredentials, setNodes, setPercentage } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/authSlice';
import { useLogoutMutation } from '../../slices/usersApiSlice';
import Axios from '../../config/Axios';
const Dashboard = () => {
    
    const { userInfo } = useSelector((state)=>state.auth);
    const { nodes } = useSelector((state)=> state.auth);
    const [email, setEmail] = useState(userInfo.email);
    const [cycle, setCycle] = useState(userInfo.cycle);


    const handleBar = () =>{
        navigate('/cycle');
        // return;
    }

    useEffect(()=>{
        setEmail(userInfo.email);
        setCycle(userInfo.cycle);
    }, [userInfo]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();
    const logoutHandler = async () => {
      try {
        const res = await logoutApiCall().unwrap();
        navigate('/');
        dispatch(logout());
        console.log(res.message);
      } catch (err) {
        console.error(err);
      }
    };

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await Axios.get('/api/users/');
            console.log(response.data);
            dispatch(setCredentials({ ...response.data }));
            
          } catch (error) {
            console.error(error.message);
            logoutHandler();
          };
        };
        fetchData();
      }, []); 

    useEffect(() => {
        if(userInfo.state == 2) {
            Axios
            .post("/api/tree", {email, cycle})
            .then( res => {
                console.log(res.data);
                dispatch(setNodes({ ...res.data }));
                const fullTree = Object.values(res.data).every(node => Object.keys(node).length > 0);
                console.log("Tree Updated Successfully!", fullTree);
                if(fullTree) {
                    Axios
                    .post("/api/users/cycle", { email, cycle })
                    .then(res => {
                    console.log('res', res.data);
                    dispatch(setCredentials({ ...res.data }));
                    console.log("Upstate to 3 Successfully!");
                    })
                    .catch(err => {
                    console.log(err);
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
      }, []);

    let percentage;
    if(nodes){ percentage = (nodes.node1.email?1:0)*25 + (nodes.node2.email?1:0)*25 + (nodes.node11.email?1:0)*12.5 + (nodes.node12.email?1:0)*12.5 + (nodes.node21.email?1:0)*12.5 + (nodes.node22.email?1:0)*12.5;}

    dispatch(setPercentage(percentage));
    
    console.log(percentage);
    return (
    <div className='dark:text-white'>
        <div className='sm:mt-10 mt-16'>
            <TaskBar cycle={userInfo.cycle} state={userInfo.state} percentage={percentage} getRewards={handleBar} getStarted={handleBar} here="dashboard" />
        </div>
        {
            nodes &&
            <div>
                <div className='w-full '>
                    {
                        <Node avatar={userInfo.avatar} username={userInfo.username} email={userInfo.email} active={true}/>
                    }
                </div>
                <div className=' grid grid-cols-2'>
                    <div className=' col-span-1'>
                        { nodes.node1.email?
                            <Node avatar={nodes.node1.avatar} username={nodes.node1.username} email={nodes.node1.email} active={nodes.node1}/>:<Node avatar={nodes.node1.avatar} active={false} /> 
                        }
                    </div>
                    <div className=' col-span-1'>
                        { nodes.node2.email?
                            <Node avatar={nodes.node2.avatar} username={nodes.node2.username} email={nodes.node2.email} active={nodes.node2}/>:<Node avatar={nodes.node2.avatar} active={false} />
                        }
                    </div>
                </div>
                <div className='flex'>
                    <div className='w-1/2 grid grid-cols-2'>
                        <div className=' col-span-1 ml-4'>
                            { nodes.node11.email?
                                <Node avatar={nodes.node11.avatar} username={nodes.node11.username} email={nodes.node11.email} active={nodes.node11}/>:<Node avatar={nodes.node11.avatar} active={false} /> 
                            }
                        </div>
                        <div className=' col-span-1 mr-4'>
                        { nodes.node12.email?
                            <Node avatar={nodes.node12.avatar} username={nodes.node12.username} email={nodes.node12.email} active={nodes.node12}/>:<Node avatar={nodes.node12.avatar} active={false} /> 
                        }
                        </div>
                    </div>
                    <div className=' w-1/2 grid grid-cols-2'>
                        <div className=' col-span-1 ml-4'>
                        { nodes.node21.email?
                            <Node avatar={nodes.node21.avatar} username={nodes.node21.username} email={nodes.node21.email} active={nodes.node21}/>:<Node avatar={nodes.node21.avatar} active={false} /> 
                        }
                        </div>
                        <div className=' col-span-1 mr-4'>
                        { nodes.node22.email?
                            <Node avatar={nodes.node22.avatar} username={nodes.node22.username} email={nodes.node22.email} active={nodes.node22}/>:<Node avatar={nodes.node22.avatar} active={false} /> 
                        }
                        </div>
                    </div>
                </div>
            </div>
        }

    </div>
    );
}

export default Dashboard
