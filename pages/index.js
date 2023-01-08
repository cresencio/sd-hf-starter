import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Typeahead } from 'react-bootstrap-typeahead';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const maxRetries = 20;
  const [style, updateStyle] = useState('realistic');
  const [artist, updateArtist] = useState('pablo picasso');
  const [finishingTouches, updateFinishingTouches] = useState('highly-detailed');
  const [input, setInput] = useState(`A ${style} type image of Cresencio in the style of ${artist} with ${finishingTouches} finishing touches.`);
  const [img, setImg] = useState(''); 
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [promptLoaded, isPromptLoaded] = useState(false);

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const onArtistChange = (value) => {
    updateArtist(value);
    setInput(`A ${style} type image of Cresencio in the style of ${artist} with ${finishingTouches} finishing touches.`);
  };

  const onStyleChange = (value) => {
    updateStyle(value);
    setInput(`A ${style} type image of Cresencio in the style of ${artist} with ${finishingTouches} finishing touches.`);
  };

  const onFinishingTouchesChange = (value) => {
    updateFinishingTouches(value);
    setInput(`A ${style} type image of Cresencio in the style of ${artist} with ${finishingTouches} finishing touches.`);
  };

  const generateAction = async () => {

    // Add this check to make sure there is no double click
  if (isGenerating && retry === 0) return;

  // Set loading has started
  setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }
  
    // Add the fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input }),
    });
  
    const data = await response.json();

    console.log(data);
    
    // If model still loading, drop that retry time
    if (response.status === 503) {
        console.log('Model is loading still :(.')
        setRetry(data.estimated_time);
        return;
    }

    // If another error, drop error
    if (!response.ok) {
        console.log(`Error: ${data.error}`);
        // Stop loading
        setIsGenerating(false);
        return;
    }

    // Set final prompt here
    setFinalPrompt(input);
    // Remove content from input box
    setInput('');
    setImg(data.image);
    setIsGenerating(false);

  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

     // Add useEffect here
useEffect(() => {
  const runRetry = async () => {
    if (retryCount === 0) {
      console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
      setRetryCount(maxRetries);
      return;
      }

    console.log(`Trying again in ${retry} seconds.`);

    await sleep(retry * 1000);

    await generateAction();
  };

  if (retry === 0) {
    return;
  }

  runRetry();
}, [retry]);

  return (
    <div className="root">
      <Head>
        <title>AI avatar | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Build my avatar</h1>
          </div>
          <div className="header-subtitle">
            <h2>Build Cresencio a unique avatar.</h2>
            {img && (
              <>
                <p className='text-yellow'>Now you try! Play with the settings below and see what you get 😏</p>
              </>
            )}
          </div>
          <div className="prompt-container">
            

          {img && (
              <>
                <Typeahead
            onChange={(selected) => {
              onStyleChange(selected)
            }}
            options={['realistic', 'oil painting', 'pencil drawing', 'concept art', 'watercolor']}
            id="style"
            placeholder="Style"
          />
          <Typeahead
            onChange={(selected) => {
              onArtistChange(selected)
            }}
            options={['Leonardo DaVinci', 'Vincent Van Gogh', 'Albrecht Dürer', 'Michelangelo', 'Salvador Dali']}
            id="artist"
            placeholder="Artist"
          />
          <Typeahead
            onChange={(selected) => {
              onFinishingTouchesChange(selected)
            }}
            options={['highly-detailed',
            'surrealism',
            'trending on artstation',
            'triadic color scheme',
            'smooth',
            'sharp focus',
            'matte',
            'elegant',
            'illustration',
            'digital paint',
            'dark',
            'gloomy',
            'octane render',
            '8k',
            '4k',
            'washed-out colors',
            'sharp',
            'dramatic lighting',
            'beautiful',
            'post-processing',
            'picture of the day',
            'ambient lighting',
            'epic composition']}
            id="finishing-touches"
            placeholder="Finishing touches"
          />
              </>
            )}

            <textarea rows={4} name="prompt" disabled className="prompt-box" value={input} onChange={onChange} placeholder={`Instructions: A ${style} type image of Cresencio in the style of ${artist} with ${finishingTouches} finishing touches.`}/>
            <div className="prompt-buttons">
            <a
              className={
                isGenerating ? 'generate-button loading' : 'generate-button'
              }
              onClick={generateAction}
            >
              {/* Tweak to show a loading indicator */}
              <div className="generate">
                {isGenerating ? (
                  <span className="loader"></span>
                ) : (
                  <p>Generate</p>
                )}
              </div>
            </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
