import React, { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import '../css/Post.css'; // Make sure to create this CSS file

export default function Post(props) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    
    const handleLike = () => {
        if (liked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setLiked(!liked);
    };
    
    const handleShare = () => {
        // Basic share functionality - can be expanded with social media API integrations
        if (navigator.share) {
            navigator.share({
                title: 'The trip to Spain',
                text: 'Check out this amazing blog post about Spain!',
                url: window.location.href,
            })
            .catch(err => console.error('Error sharing:', err));
        } else {
            // Fallback for browsers that don't support navigator.share
            alert('Share this link: ' + window.location.href);
        }
    };

    return (
        <div className="post">
            <div className="image-container">
                <img 
                    src="https://photos.smugmug.com/photos/i-MgVPpnd/0/f647accb/L/i-MgVPpnd-L.jpg" 
                    alt="View of Spain"
                    className="post-image"
                />
            </div>
            <div className="content">
                <h2 className="post-title">The trip to Spain</h2>
                <div className="post-meta">
                    <a className="author">blah blah</a>
                    <time>2025-03-04 16:03</time>
                </div>
                <p className="post-summary">
                    Spain, located on the Iberian Peninsula in southwestern Europe, is renowned for its vibrant culture, 
                    including passionate flamenco dancing, delicious tapas cuisine, and lively festivals, with major 
                    cities like Madrid and Barcelona attracting visitors with their stunning architecture and rich 
                    history; the country is also famous for its sunny Mediterranean coast and the iconic bullfighting tradition.
                </p>
                
                {/* This section will conditionally render for posts with more content */}
                <div className="post-content">
                    {props.fullContent && props.fullContent}
                </div>
                
                <div className="post-actions">
                    <button 
                        className={`like-button ${liked ? 'liked' : ''}`} 
                        onClick={handleLike}
                    >
                        <Heart className="icon" fill={liked ? "#ff2a6d" : "none"} color={liked ? "#ff2a6d" : "#666"} />
                        <span>{likeCount}</span>
                    </button>
                    
                    <button className="share-button" onClick={handleShare}>
                        <Share2 className="icon" />
                        <span>Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}