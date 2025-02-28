
//const apiUrl = window.electronAPI.getApiUrl();
const apiUrl = window.electronAPI?.getApiUrl() || 'http://localhost:3000';




async function updateDashboardCounts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/dashboard/counts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        document.querySelector('#active-PCs .count').textContent = data.activePCs;
        document.querySelector('#active-Printers .count').textContent = data.activePrinters;   
    } catch (error) {
        console.error('Error fetching dashboard counts:', error);
    }
}


    const role = localStorage.getItem('role');
    updateDashboardCounts();
    
    if (role === 'admin') {
        document.getElementById('addPcBtn').style.display = 'inline-block';
        document.getElementById('addPrinterBtn').style.display = 'inline-block';
        document.getElementById('addUserBtn').style.display = 'inline-block';
        document.getElementById('manageUsersBtn').style.display = 'inline-block';
    }
    document.getElementById('addPcBtn').addEventListener('click', () => {
        window.electronAPI.openAddPc();
    });
    
    document.getElementById('addPrinterBtn').addEventListener('click', () => {
        window.electronAPI.openAddPrinter();
    });
    
    document.getElementById('addUserBtn').addEventListener('click', () => {
        window.electronAPI.openAddUser();
    });

    /*document.getElementById('manageUsersBtn').addEventListener('click', () => {
        window.electronAPI.openManageUsers();
    });*/
    

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let currentIndex = 0;

    document.addEventListener('keydown', (event) => {
        if (event.key === konamiCode[currentIndex]) {
            currentIndex++;
            if (currentIndex === konamiCode.length) {
                triggerEasterEgg();
                currentIndex = 0; // Reset for another try
            }
        } else {
            currentIndex = 0; // Reset if the sequence breaks
        }
    });
    function triggerEasterEgg() {
        const asciiArt = `
                                                 
    TTTTTTTTTTTTTEEEEEEEEEEEEE XXXXXX       ####   AAAAAAAAAA    RRRRRRRRRRRR 
   TTTTTTTTTTTTT EEEEEEEEEEEEE  XXXXXX   ####     AAAAAAAAAAA   RRRRRRRRRRRRRR
      TTTTTT    EEEEEE           XXXXX####       AAAAAA AAAAA   RRRRR    RRRRR
      TTTTTT    EEEEEEEEEEEEE     X#####        AAAAAA  AAAAA  RRRRRR  RRRRRR 
     TTTTTT    EEEEEEEEEEEEE      ####XXX      AAAAAA  AAAAAA  RRRRRRRRRR     
     TTTTTT    EEEEEE           ####XXXXXX    AAAAAAAAAAAAAAA RRRRR  RRRRRR   
    TTTTTT    EEEEEEEEEEEEEE  ####   XXXXXX  AAAAAA    AAAAAA RRRRR   RRRRRR  
    TTTTTT    EEEEEEEEEEEEE ####      XXXXXXAAAAAAA    AAAAAARRRRRR    RRRRRR 
                        
            `;
        
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.color = '#00ff00';
        container.style.fontFamily = 'monospace';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.zIndex = '1000';
    
        const message = document.createElement('pre');
        message.textContent = `${asciiArt}\n\n"The Force is with you, young Skywalker. But you are not a Jedi yet."`;
    
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.fontSize = '16px';
        closeButton.style.cursor = 'pointer';
    
        closeButton.addEventListener('click', () => {
            document.body.removeChild(container);
        });
    
        container.appendChild(message);
        container.appendChild(closeButton);
        document.body.appendChild(container);
    }
    


