'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import EmojiConfetti from '@/components/emoji_confetti';

const IdeaPage = ({ params }) => {
  const id = params?.id;

  const [wallet, setwallet] = useState('');
  const [idea, setIdea] = useState([]);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const call = () => {
      const loggedin = Cookies.get('idea_wallet');
      setwallet(loggedin);
    };
    call();
  }, []);

  
    const fetchIdea = async () => {
      try {
        setloading(true);
        const res = await fetch(`/api/idea/${id}`);
        const data = await res.json();
        setIdea(data.idea);
        console.log('ideas fetch', data);
        setloading(false);
      } catch (err) {
        console.error('Failed to fetch ideas:', err);
        setloading(false);
      }
    };

    useEffect(() => {

    fetchIdea();
  }, [id]);

  return (
    <>
      <div
        className="px-10 py-20 min-h-screen"
        style={{ background: 'radial-gradient(circle, #000000 , #000000)' }}
      >
        <div className="flex gap-6">
          <div
            className="w-4/5 border border-gray-500 rounded-xl"
            style={{
              boxShadow: 'inset -10px -10px 60px 0 rgba(0, 0, 0, 0.4)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex flex-row gap-4">
              <div
                className="relative p-10 rounded-xl w-full"
                style={{
                  background:
                    'radial-gradient(circle at top left, #0b262e 10%, #051418 65%, #78aba6)',
                  transition: 'background 0.5s ease-out',
                }}
              >
                <div className="text-white text-3xl font-semibold mb-10 capitalize">
                  {idea?.title}
                </div>

                <div className="flex justify-between text-white items-center">
                  <div
                    className={
                      'bg-[#1D4E4F] text-white font-bold text-xs p-2 rounded-lg'
                    }
                  >
                    {idea?.userId}
                  </div>
                  <div
                    className="px-2 py-1 rounded -mt-2 capitalize"
                    style={{ fontSize: '15px' }}
                  >
                    <span
                      className={
                        'inline-block bg-[#1D4E4F] text-white font-bold text-xs p-2 rounded-lg'
                      }
                    >
                      Category
                    </span>{' '}
                    :{idea?.category}
                  </div>
                  {/*<div*/}
                  {/*  className="uppercase px-2 py-1 rounded -mt-2"*/}
                  {/*  style={{*/}
                  {/*    fontSize: '14px',*/}
                  {/*    color: '#5DEBD7',*/}
                  {/*  }}*/}
                  {/*>*/}
                  {/*  Status*/}
                  {/*</div>*/}

                  <div
                    className="px-2 py-1 rounded -mt-2 flex items-center gap-3"
                    style={{
                      fontSize: '15px',
                      color: '#FFCAD4',
                    }}
                  >
                    <div className={'flex'}>
                      <span className={'mr-1'}>❤️</span>
                      {idea?.vote_count}
                    </div>
                    {/*TODO: Integrate voting flow*/}
                    <EmojiConfetti ideaId={id} onVoteSuccess={fetchIdea} />

                  </div>
                </div>

                <div className="text-white text-xl mt-16 font-bold">
                  Problem Solve:
                </div>
                <div className="text-gray-300 text-md mt-4 text-[18px]">
                  {idea?.problem_solved}
                </div>

                <div className="text-white text-xl mt-10 font-bold">
                  Possible Solution:
                </div>
                <div className="text-gray-300 text-md mt-4 text-[18px]">
                  {idea?.possible_solution}
                </div>

                <div className="text-white text-xl mt-10 font-bold">
                  Resources:
                </div>
                <div className="text-gray-300 text-md mt-4 text-[18px]">
                  {idea?.resources}
                </div>

                <div className="text-white text-xl mt-10 font-bold">
                  Additional:
                </div>
                <div className="text-gray-300 text-md mt-4 text-[18px]">
                  {idea?.additional}
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-2/5 border border-gray-500 rounded-xl"
            style={{
              boxShadow: 'inset -10px -10px 60px 0 rgba(0, 0, 0, 0.4)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="text-center text-white text-lg py-4 border-b">
              Comments
            </div>
          </div>

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
      </div>
    </>
  );
};

export default IdeaPage;
