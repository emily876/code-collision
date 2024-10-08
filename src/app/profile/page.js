'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { FaLightbulb, FaComments, FaThumbsUp, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import EditForm from '@/components/Editform';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const Profile = () => {
  const [profileDetails, setProfileDetails] = useState({});
  const [loading, setloading] = useState(true);
  const [ideas, setIdeas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIdea, setCurrentIdea] = useState(null);
  const [voteData, setVoteData] = useState([]);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [imagenumber, setimagenumber] = useState();

  const [ideasOnBlock, setIdeasOnBlock] = useState([]);
  const [ideasNotOnBlock, setIdeasNotOnBlock] = useState([]);
  const [offchainvotes, setoffchainvotes] = useState([]);
  const [activeTab, setActiveTab] = useState('verified');

  const [createideadone, setcreateideadone] = useState(false);

  const { account, connected, disconnect, network } = useWallet();

  useEffect(() => {
    const fetchnumber = async () => {
      const currentUrl = window.location.href;
      const params = new URLSearchParams(currentUrl.split('?')[1]);
      const image = params.get('image');
      setimagenumber(image);
    };
    fetchnumber();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `https://api.multiavatar.com/${imagenumber}`;

        const response = await axios.get(apiUrl);
        const svgDataUri = `data:image/svg+xml,${encodeURIComponent(
          response.data
        )}`;
        setAvatarUrl(svgDataUri);
      } catch (error) {
        console.error('Error fetching avatar:', error.message);
      }
    };

    fetchData();
  }, [imagenumber]);

  const handleEditClick = (idea) => {
    setCurrentIdea(idea);
    setIsEditing(true);
  };

  useEffect(() => {
    const getProfile = () => {
      const token = Cookies.get('access-token'); // Assuming JWT is stored as 'idea_token'
      if(token)
      {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      setProfileDetails(decodedToken);
      }
    };

    getProfile();
  }, []);

  const fetchIdeas = async () => {
    try {
      setloading(true);
      const res = await fetch(`/api/idea?userId=${profileDetails.userId}`);
      const data = await res.json();
      setIdeas(data.ideas);

      // Separate ideas based on is_stored_on_block value
      const ideasOnBlock = data.ideas.filter(idea => idea.is_stored_on_block === true);
      const ideasNotOnBlock = data.ideas.filter(idea => idea.is_stored_on_block === false);
      
      // Set the respective state for both
      setIdeasOnBlock(ideasOnBlock);
      setIdeasNotOnBlock(ideasNotOnBlock);

      console.log('ideas fetch', data);
      setloading(false);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
      setloading(false);
    }
  };

  const getVoteData = async () => {
    try {
      const res = await fetch(`/api/vote`, {
        method: 'POST',
        body: JSON.stringify({ userId: profileDetails.userId }),
      });
      const data = await res.json();
      setVoteData(data.votesByUser);

       // Separate ideas based on is_stored_on_block value
       const votesOnBlock = data.votesByUser.filter(vote => vote.is_stored_on_block === true);
       const votesNotOnBlock = data.votesByUser.filter(vote => vote.is_stored_on_block === false);
       
       setoffchainvotes(votesNotOnBlock);

      console.log("vote data", data);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
      // setloading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [profileDetails, createideadone]);

  useEffect(() => {
    getVoteData();
  }, [profileDetails]);

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!', {
          position: 'top-right',
          autoClose: 2000,
        });
      })
      .catch((err) => {
        toast.error('Failed to copy text!', {
          position: 'top-right',
          autoClose: 2000,
        });
        console.error('Failed to copy text: ', err);
      });
  };

  // Function to partially hide the id or wallet
  const shortenText = (text) => {
    if (!text) return '';
    return `${text.slice(0, 6)}...${text.slice(-4)}`;
  };

  const handleMouseMove = (e) => {
    const target = e.currentTarget;
    const { clientX, clientY } = e;
    const { left, top, width, height } = target.getBoundingClientRect();
    const xPercent = ((clientX - left) / width) * 100;
    const yPercent = ((clientY - top) / height) * 100;

    target.style.background = `radial-gradient(circle at top, #061419, transparent), radial-gradient(circle at ${xPercent}% ${yPercent}%, #061419, transparent)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background =
      'radial-gradient(circle at top, #032428, transparent)';
  };

  const handleSave = async (updatedIdea) => {
    try {
      const response = await fetch(`/api/idea/${updatedIdea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedIdea.title,
          problem_solved: updatedIdea.description1,
          possible_solution: updatedIdea.description2,
          resources: updatedIdea.description3,
          additional: updatedIdea.description4,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update the idea');
      }

      const updatedIdeaFromAPI = await response.json();

      setIdeas((prevIdeas) => {
        const updatedIdeas = prevIdeas.map((idea) =>
          idea.id === updatedIdea.id ? updatedIdeaFromAPI.idea : idea
        );

        console.log('Updated Ideas:', updatedIdeas);

        return updatedIdeas;
      });

      setIdeasNotOnBlock((prevIdeas) => {
        const updatedIdeas = prevIdeas.map((idea) =>
          idea.id === updatedIdea.id ? updatedIdeaFromAPI.idea : idea
        );
        console.log('Updated Ideas:', updatedIdeas);

        return updatedIdeas;
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };


  async function verifyIdea(ideaId) {
    const response = await fetch('/api/idea/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ideaId}),
    });

    return response;
  }

  const handleVerifyIdea = async (idea) => { 
    setloading(true);

    if(network.name == "mainnet"){
        toast.warn('Please change your network to Testnet', {
          position: 'top-right',
        });
        setloading(false);
        return;
    }
      try {
          const mintTransaction = {
            arguments: [
              `${idea.id}`,
              '0x8ccc0aaa87309ab8c7f8c1c68e87e33732c03289a289701a3eaf75c78f283579',
            ],
            function:
              '0x8ccc0aaa87309ab8c7f8c1c68e87e33732c03289a289701a3eaf75c78f283579::sharetos::add_idea',
            type: 'entry_function_payload',
            type_arguments: [],
          };

          const mintResponse = await window.aptos.signAndSubmitTransaction(
            mintTransaction
          );

          if(mintResponse)
          {
          console.log('created idea done:', mintResponse);

          const idea_verify = await verifyIdea(idea.id);

          if(idea_verify.ok)
          {
          setcreateideadone(true);
           }
          }
      setloading(false);
    } catch (error) {
      console.error('Error handling', error);
      setloading(false);
    }
  };



  const handleVerifyVote = async (ideaId) => {
    if (!account?.address) {
      toast.warn('Please connect your wallet to upvote', {
        position: 'top-right',
      });
      return;
    }

    const token = Cookies.get('access-token'); // Assuming JWT is stored as 'idea_token'
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    try {
      // First, make the API call to your backend to register the vote.
      const res = await fetch(`/api/idea/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideaId, userId }),
      });

      if (res.ok) {
        // If backend API succeeds, proceed to call the Move contract.
        const mintTransaction = {
          arguments: [
            `${ideaId}`,
            '0x8ccc0aaa87309ab8c7f8c1c68e87e33732c03289a289701a3eaf75c78f283579',
          ],
          function:
            '0x8ccc0aaa87309ab8c7f8c1c68e87e33732c03289a289701a3eaf75c78f283579::sharetos::upvote_defi',
          type: 'entry_function_payload',
          type_arguments: [],
        };

        const mintResponse = await window.aptos.signAndSubmitTransaction(
          mintTransaction
        );

        // console.log('Vote transaction done:', mintResponse);

        if (mintResponse) {
          // Update vote count in the frontend after successful transaction

          const resp = await fetch(`/api/idea/vote/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ideaId, userId }),
          });

          if (resp.ok) {
            const updatedIdeas = ideas.map((idea) =>
              idea.id === ideaId
                ? { ...idea, vote_count: idea.vote_count + 1 }
                : idea
            );
            setIdeas(updatedIdeas);
            toast.success('Vote recorded successfully!');
          }
        }
      } else {
        toast.error('Already voted');
        setloading(false);
      }
    } catch (error) {
      toast.error('An error occurred while voting. Please try again later.');
      console.error('Error voting:', error);
      setloading(false);
    }
  };

  return (
    <div className="lg:mx-20 md:mx-20 mx-4 min-h-screen w-full">
      <div className="flex lg:flex-row md:flex-row flex-col justify-center items-center text-white gap-10 mt-10">
        <div className="relative w-full flex flex-col lg:justify-start md:justify-start justify-center lg:items-start md:items-start items-center">
          <img
            src={avatarUrl}
            className="rounded-full"
            style={{ width: '160px', height: '160px' }}
            alt="Profile"
          />

          {/* Position the userId and wallet_address at the bottom of the image */}
          <div className="lg:absolute md:absolute lg:top-20 lg:left-48 md:top-40 md:left-0 w-auto lg:mt-0 mt-6 flex flex-col lg:justify-start md:justify-start justify-center lg:items-start md:items-start items-center">
            <div className="flex justify-start items-start gap-2">
              <div>UserID:</div>
              <div>{shortenText(profileDetails.userId)}</div>
              <FaCopy
                className="cursor-pointer"
                onClick={() => copyToClipboard(profileDetails.userId)}
                title="Copy User ID"
              />
            </div>

            <div className="flex justify-start items-start gap-2 mt-2">
              <div>Wallet:</div>
              <div>{shortenText(profileDetails.wallet_address)}</div>
              <FaCopy
                className="cursor-pointer"
                onClick={() => copyToClipboard(profileDetails.wallet_address)}
                title="Copy Wallet Address"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="lg:w-[164px] md:w-[164px] w-[100px] pt-[27px] relative lg:pl-[20px] md:pl-[20px] pl-[4px] lg:h-[167px] md:h-[167px] h-[100px] rounded-[12px] bg-gradient-to-b from-[#000000] to-[#10434a] border border-white/[0.2]">
            <h6 className="text-white w-max semiBold text-[14px] leading-normal ">
              Total Ideas
            </h6>
            <div className="flex items-center absolute lg:bottom-[37px] md:bottom-[37px] bottom-[10px] h-max gap-[19px]">
              <FaLightbulb style={{ width: '30px', height: '30px' }} />
              <p className="lg:text-[42px] md:text-[42px] text-[20px] leading-tight Graph-normal">
                {ideas?.length}
              </p>
            </div>
          </div>

          {/* <div className="w-[164px] pt-[27px] relative  pl-[20px] h-[167px] rounded-[12px] bg-gradient-to-b from-[#000000] to-[#10434a] border border-white/[0.2]">
            <h6 className="text-white  w-max  semiBold text-[14px] leading-normal ">
              Total Chat
            </h6>
            <div className="flex items-center absolute bottom-[37px] h-max gap-[19px]">
              <FaComments style={{ width: '30px', height: '30px' }} />
              <p className="text-[42px]  leading-tight Graph-normal">{10}</p>
            </div>
          </div> */}

          <div className="lg:w-[164px] md:w-[164px] w-[100px] pt-[27px] relative lg:pl-[20px] md:pl-[20px] pl-[4px] lg:h-[167px] md:h-[167px] h-[100px] rounded-[12px] bg-gradient-to-b from-[#000000] to-[#10434a] border border-white/[0.2]">
            <h6 className="text-white  w-max  semiBold text-[14px] leading-normal ">
              Total Votes
            </h6>
            <div className="flex items-center absolute lg:bottom-[37px] md:bottom-[37px] bottom-[10px] h-max gap-[19px]">
              <FaThumbsUp style={{ width: '30px', height: '30px' }} />
              <p className="lg:text-[42px] md:text-[42px] text-[20px] leading-tight Graph-normal">
                {voteData?.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start space-x-8 mt-10 pb-4 border-b-2 border-gray-500">
        <button
          className={`text-lg font-bold py-2 px-4 transition ${
            activeTab === 'verified' ? 
              'bg-[#539b82] text-white'
              : 'bg-gray-600 text-gray-300'
          }`}
          onClick={() => setActiveTab('verified')}
        >
          All Ideas
        </button>
        <button
          className={`text-lg font-bold py-2 px-4 transition ${
            activeTab === 'unverified' ? 
              'bg-[#539b82] text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}
          onClick={() => setActiveTab('unverified')}
        >
          Off Chain Ideas
        </button>
        <button
          className={`text-lg font-bold py-2 px-4 transition ${
            activeTab === 'offchainvotes' ? 
              'bg-[#539b82] text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}
          onClick={() => setActiveTab('offchainvotes')}
        >
          Off Chain Votes
        </button>
      </div>

      {activeTab === 'verified' && (
      <div className="my-10 grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4">
        {ideas?.map((idea) => (
          <div
            key={idea.id}
            className="flex flex-col  justify-between relative cursor-pointer p-6 border-white/[0.2] border rounded-xl "
            style={{
              background:
                'radial-gradient(circle at top, #032428, transparent)',
              transition: 'background 0.5s ease-out',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            // onClick={() => router.push(`/ideas/${idea.id}`)}
          >
            <div>
              <div className="text-white text-xl font-semibold mb-4 capitalize">
                {idea?.title}
              </div>

              <div className="text-gray-300 text-sm my-6">
                <span className="font-bold">
                  {idea?.problem_solved?.length > 100
                    ? idea.problem_solved.substring(0, 100) + '...'
                    : idea.problem_solved}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-white items-center">
              <div className="flex gap-4 items-center">
                <div
                  style={{
                    fontSize: '15px',
                    color: '#FFCAD4',
                    marginTop: '3px',
                  }}
                >
                  <span className={'mr-1'}>❤️</span> {idea?.vote_count}
                </div>
                {/* <div
                  className="capitalize px-2 py-1 rounded-lg text-center text-[14px] bg-green-100 z-[10] text-green-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!wallet) {
                      toast.warn('Please connect your wallet to upvote', {
                        position: 'top-right',
                      });
                    } else {
                      handleVote(idea.id);
                    }
                  }}
                >
                  Vote 👍
                </div> */}

                <div
                  className="capitalize px-6 py-1 rounded-lg text-center text-[14px] bg-blue-100 z-[10] text-blue-800"
                  onClick={() => handleEditClick(idea)}
                >
                  Edit
                </div>
              </div>
              <div
                className="px-4 py-1.5 rounded-lg text-center bg-white text-black font-bold"
                style={{ fontSize: '13px' }}
              >
                {idea.category}
              </div>
            </div>
          </div>
        ))}
      </div>)}


      {activeTab === 'unverified' && (
      <div className="my-10 grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4">
        {ideasNotOnBlock?.map((idea) => (
          <div
            key={idea.id}
            className="flex flex-col  justify-between relative cursor-pointer p-6 border-white/[0.2] border rounded-xl "
            style={{
              background:
                'radial-gradient(circle at top, #032428, transparent)',
              transition: 'background 0.5s ease-out',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div>
              <div className="text-white text-xl font-semibold mb-4 capitalize">
                {idea?.title}
              </div>

              <div className="text-gray-300 text-sm my-6">
                <span className="font-bold">
                  {idea?.problem_solved?.length > 100
                    ? idea.problem_solved.substring(0, 100) + '...'
                    : idea.problem_solved}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-white items-center">
              <div className="flex gap-4 items-center">
                <div
                  style={{
                    fontSize: '15px',
                    color: '#FFCAD4',
                    marginTop: '3px',
                  }}
                >
                  <span className={'mr-1'}>❤️</span> {idea?.vote_count}
                </div>

                <div
                  className="capitalize px-6 py-1 rounded-lg text-center text-[14px] bg-blue-100 z-[10] text-blue-800"
                  onClick={() => handleEditClick(idea)}
                >
                  Edit
                </div>

                <button
                  className="capitalize px-6 py-1 rounded-lg text-center text-[14px] bg-green-100 z-[10] text-green-800"
                  onClick={() => handleVerifyIdea(idea)}
                >
                  Verify Idea
                </button>

              </div>
              <div
                className="px-4 py-1.5 rounded-lg text-center bg-white text-black font-bold"
                style={{ fontSize: '13px' }}
              >
                {idea.category}
              </div>
            </div>
          </div>
        ))}
      </div>)}

      {activeTab === 'offchainvotes' && (
      <div className="my-10 grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4">
        {offchainvotes?.map((vote) => (
          <div
            key={vote.idea.id}
            className="flex flex-col  justify-between relative cursor-pointer p-6 border-white/[0.2] border rounded-xl "
            style={{
              background:
                'radial-gradient(circle at top, #032428, transparent)',
              transition: 'background 0.5s ease-out',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div>
              <div className="text-white text-xl font-semibold mb-4 capitalize">
                {vote?.idea?.title}
              </div>

              <div className="text-gray-300 text-sm my-6">
                <span className="font-bold">
                  {vote?.idea?.problem_solved?.length > 100
                    ? vote?.idea.problem_solved.substring(0, 100) + '...'
                    : vote?.idea.problem_solved}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-white items-center">
              <div className="flex gap-4 items-center">
                <div
                  style={{
                    fontSize: '15px',
                    color: '#FFCAD4',
                    marginTop: '3px',
                  }}
                >
                  <span className={'mr-1'}>❤️</span> {vote?.idea?.vote_count}
                </div>
                <div
                  className="capitalize px-2 py-1 rounded-lg text-center text-[14px] bg-green-100 z-[10] text-green-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!account?.address) {
                      toast.warn('Please connect your wallet to upvote', {
                        position: 'top-right',
                      });
                    } else {
                      handleVerifyVote(vote?.idea?.id);
                    }
                  }}
                >
                  Verify Vote 👍
                </div>
              </div>
              <div
                className="px-4 py-1.5 rounded-lg text-center bg-white text-black font-bold"
                style={{ fontSize: '13px' }}
              >
                {vote?.idea.category}
              </div>
            </div>
          </div>
        ))}
      </div>)}

        {isEditing && (
          <EditForm
            idea={currentIdea}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        )}

        {loading && (
          <div
            style={{ backgroundColor: '#222944E5' }}
            className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
            id="popupmodal"
          >
            <div className="relative p-4 w-full max-h-full">
              <div className="relative rounded-lg">
                <div className="flex justify-center gap-4">
                  <img
                    src="/smallloader.gif"
                    alt="Loading icon"
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      
    </div>
  );
};

export default Profile;
