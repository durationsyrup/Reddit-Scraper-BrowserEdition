// Notes:
// Made this a couple months ago from now (9/2/20)
// Not 100% if this works right, I may have uploaded the wrong file...
// If this does work, great. It scraped usernames from subreddits.
// And post are stored ScrapedPost variable
// All this should put copied into the console.
// Not sure if this can turned into a bookmarklet.

// Thanks for using my code.

let Popup = `
    <div style="font-size: 12pt; background: white; position: fixed;left: 0px; top: 0px; width: 100vw; min-height: 100vh; z-index: 9999; display: flex; flex-direction: column;" class="SCRAPETOOL">
        <div style="width: 100%; margin-top: 3vw; display: flex; justify-content: center;" class="tool_title">
            <h3 style="padding: 10px; font-size: 14pt">Reddit Scrape Tool</h3>
        </div>
        <div style="width: 50%; margin: 3vw auto; display: flex; flex-direction: column; justify-content: center;" class="info">
            <label>Enter name of subreddit to scrape!</label>
            <input style="outline: none; border: 1px solid black; padding: 8px;" type="text" class="subreddit" placeholder="SubReddit?"/>
            <label>Sort By?</label>
            <select style="outline: none; border: 1px solid black; padding: 8px;" name="opt" id="selecte" class="option">
                <option value="new">New</option>
                <option value="hot">Hot</option>
                <option value="rising">Rising</option>
                <option value="controversial">Controversial</option>
                <option value="top">Top</option>
            </select>
            <a class="enter" style="font-weight: bold; color: black; cursor: pointer; text-align: center; padding: 10px; border: 1px solid black; margin: 3vw;" onclick="StartHack()">BEGIN</a>
            <div style="display: grid; margin: 1vw; grid-template-columns: auto auto auto; text-align: center;">
                <a style="text-decoration: underline; cursor: pointer;" onclick="countUsernames()">Usernames: <span id="countUsernames" >0</span></a>
                <a style="text-decoration: underline; cursor: pointer;" onclick="countUserURLS()">User URLS: <span id="countUserURLS" >0</span></a>
                <a style="text-decoration: underline; cursor: pointer;" onclick="countPostURLS()">Post URLS: <span id="countPostURLS" >0</span></a>
            </div>
                <textarea id="scrape_tool_text" style="height: 10vw; font-weight: bold; color: black; cursor: pointer; text-align: center; padding: 10px; border: 1px solid black; margin: 1vw;">
                </textarea>
        </div>
    </div>
`;

document.body.appendChild(new DOMParser().parseFromString(Popup,"text/html").body);

let UserURLS = [];
let UserNames = [];
let commentURLS = [];
let ScrapedPost = [];


let subreddit = "";
let Opt = "";
let URL = "";
let selectedEle = null;

document.getElementById("scrape_tool_text").onclick = () => {
    document.getElementById("scrape_tool_text").select();
    document.execCommand("copy");
};
function countUsernames(){
    selectedEle = 0;
    document.getElementById("scrape_tool_text").value = UserNames.join("\n");
}
function countUserURLS(){
    selectedEle = 1;
    document.getElementById("scrape_tool_text").value = UserURLS.join("\n");
}
function countPostURLS(){
    selectedEle = 2;
    document.getElementById("scrape_tool_text").value = commentURLS.join("\n");
}

setInterval(()=>{
    document.getElementById("countUsernames").innerText = String(UserNames.length);
    document.getElementById("countUserURLS").innerText = String(UserURLS.length);
    document.getElementById("countPostURLS").innerText = String(commentURLS.length);
    if(selectedEle != null){
        if(selectedEle === 0){
            document.getElementById("scrape_tool_text").value = UserNames.join("\n");
        }
        if(selectedEle === 1){
            document.getElementById("scrape_tool_text").value = UserURLS.join("\n");
        }
        if(selectedEle === 2){
            document.getElementById("scrape_tool_text").value = commentURLS.join("\n");
        }
    }
}, 600);

async function StartHack(){
    subreddit = document.querySelector("input.subreddit").value;
    Opt = document.querySelector("#selecte").selectedOptions[0].value;
    URL = `https://old.reddit.com/r/${subreddit}/${Opt}/`;
    
    const Init = async() =>{
    running = true;
    let response;
    
    function clean(){
        UserNames = [...new Set(UserNames.flat())];
        UserURLS = [...new Set(UserURLS.flat())];
        commentURLS = [...new Set(commentURLS.flat())];
    }
    
    async function FetchPage(url){
        response = await fetch(url,{mode: "cors"})
        .then(e=>e.text())
        .then(e=> new DOMParser().parseFromString(e, "text/html"));
        commentURLS.push([...response.querySelectorAll(".comments")].map(e=>e.href));
        UserURLS.push([...response.querySelectorAll("a.author")].map(e=>e.href.replace("//old.","//www.")));
        UserNames.push([...response.querySelectorAll("a.author")].map(e=>e.textContent));
        
        UserURLS = [...new Set(UserURLS)];
        UserNames = [...new Set(UserNames)];
        
        clean();
        
        try{
            ScrapedPost.push(
            {
                title: response.querySelector("a.title").textContent,
                content: response.querySelector(".expando form .usertext-body .md p").textContent
            });
        }catch(err){
            console.log(err)
        }
        
        try{
            URL = response.querySelector("a[rel*='next']").href;
            return true;
        }catch(err){
            console.log(err)
            return false;
        }
    }
    
    async function GetMore(){
        await commentURLS.forEach(async (e)=> {
            await FetchPage(e);
        });
    }
    
    let responded = ( await FetchPage(URL));
    
    if(responded){
        Init();
    }else{
        await GetMore();
        alert("Almost finished!");
    }
    }
    await Init();
}

// Get questions that where posted...
// ScrapedPost.map((e)=>{return e.title}).filter(e=>/Who|Where|When|What|How/ig.test(e) && e.includes("?")).join("\n")
