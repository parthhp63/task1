
let displayid="wordpress"

function changescreen(id){
    document.getElementById(displayid).style.display="none";
    document.getElementById(id).style.display="block";
    displayid=id;
}

function prevSlide(){
    const btnn=document.getElementById("section10-rowdiv");
    // console.log(btnn);
    
    btnn.scrollLeft -=200;
}

function nextSlide(){
    const btnn=document.getElementById("section10-rowdiv");
    btnn.scrollLeft +=200;
}