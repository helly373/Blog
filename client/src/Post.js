export default function Post() {
    return(
        <div className="post">
            <div className="image">
             <img src="https://photos.smugmug.com/photos/i-MgVPpnd/0/f647accb/L/i-MgVPpnd-L.jpg"></img>
        </div>
        <div className="texts">
          <h2>The trip to Spain</h2>
          <p className="info">
            <a className="author">blah blah</a>
            <time>2025-03-04 16:03</time>
          </p>
            <p className="summary">Spain, located on the Iberian Peninsula in southwestern Europe, is renowned for its vibrant culture, including passionate flamenco dancing, delicious tapas cuisine, and lively festivals, with major cities like Madrid and Barcelona attracting visitors with their stunning architecture and rich history; the country is also famous for its sunny Mediterranean coast and the iconic bullfighting tradition. </p>
          </div> 
        </div>
    );
}