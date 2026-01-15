// Dark/Light Mode Toggle
(function() {
  'use strict';
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('swagger-theme') || 'light';
  
  // Apply theme on load
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('swagger-theme', theme);
  }
  
  // Apply saved theme
  applyTheme(currentTheme);
  
  // Create toggle button
  function createThemeToggle() {
    const container = document.createElement('div');
    container.className = 'theme-toggle-container';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.id = 'theme-toggle';
    toggleBtn.textContent = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    toggleBtn.addEventListener('click', function() {
      const isDark = document.body.classList.contains('dark-mode');
      if (isDark) {
        applyTheme('light');
        toggleBtn.textContent = '🌙 Dark Mode';
      } else {
        applyTheme('dark');
        toggleBtn.textContent = '☀️ Light Mode';
      }
    });
    
    container.appendChild(toggleBtn);
    document.body.appendChild(container);
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeToggle);
  } else {
    createThemeToggle();
  }
  
  // Add section headers after Swagger UI loads
  function addSectionHeaders() {
    setTimeout(() => {
      const tags = document.querySelectorAll('.opblock-tag-section');
      
      tags.forEach(tag => {
        const tagName = tag.querySelector('.opblock-tag')?.textContent?.trim();
        
        if (tagName) {
          // Check if header already exists
          if (!tag.previousElementSibling || !tag.previousElementSibling.classList.contains('api-section-header')) {
            const header = document.createElement('div');
            header.className = 'api-section-header';
            
            let headerText = tagName;
            let badge = '';
            
            // Customize headers based on tag
            switch(tagName) {
              case 'QR Code':
                headerText = '📱 QR Code Management';
                badge = '<span class="example-badge">Generate & Validate</span>';
                break;
              case 'Upload':
                headerText = '📤 Image Upload';
                badge = '<span class="example-badge">File Management</span>';
                break;
              case 'Auth':
                headerText = '🔐 Authentication';
                badge = '<span class="example-badge">User Management</span>';
                break;
              case 'Health':
                headerText = '💚 Health Check';
                badge = '<span class="example-badge">System Status</span>';
                break;
            }
            
            header.innerHTML = headerText + badge;
            tag.parentNode.insertBefore(header, tag);
          }
        }
      });
    }, 500);
  }
  
  // Hide default Swagger endpoints
  function hideDefaultEndpoints() {
    const defaultEndpoints = document.querySelectorAll(
      '.opblock[data-path="/swagger.json"], ' +
      '.opblock[data-path="/swagger.yaml"], ' +
      '.opblock[data-path="/swagger"], ' +
      '.opblock[data-path="/api-docs/swagger.json"]'
    );
    
    defaultEndpoints.forEach(endpoint => {
      endpoint.style.display = 'none';
    });
  }
  
  // Add testing sections to each endpoint
  function addTestingSections() {
    setTimeout(() => {
      const opblocks = document.querySelectorAll('.opblock');
      
      opblocks.forEach(opblock => {
        const path = opblock.getAttribute('data-path');
        if (!path) return;
        
        // Check if testing section already exists
        const content = opblock.querySelector('.opblock-body');
        if (!content) return;
        
        const existingSection = content.querySelector('.testing-section');
        if (existingSection) return;
        
        const testingDiv = document.createElement('div');
        testingDiv.className = 'testing-section';
        
        let testingContent = '<h4>🧪 Testing Instructions</h4>';
        
        // Add specific instructions based on endpoint
        if (path.includes('/qr/generate')) {
          testingContent += '<p><strong>Example Request:</strong> Send POST request with optional "data" field</p>';
          testingContent += '<p><strong>Expected Response:</strong> Returns QR code URL and upload URL</p>';
        } else if (path.includes('/qr/validate')) {
          testingContent += '<p><strong>Example:</strong> Use code from generated QR (e.g., "1768305296192")</p>';
          testingContent += '<p><strong>Expected:</strong> Returns validation status (isValid: true/false)</p>';
        } else if (path.includes('/upload/upload')) {
          testingContent += '<p><strong>Example:</strong> Upload image file with "code" and "image" fields</p>';
          testingContent += '<p><strong>Supported Formats:</strong> JPEG, PNG, GIF, WEBP (Max 10MB)</p>';
        } else if (path.includes('/auth/register')) {
          testingContent += '<p><strong>Example:</strong> Provide first_name, last_name, email, password</p>';
          testingContent += '<p><strong>Password Requirements:</strong> Uppercase, number, special character, min 6 chars</p>';
        } else if (path.includes('/auth/login')) {
          testingContent += '<p><strong>Example:</strong> Provide email and password</p>';
          testingContent += '<p><strong>Response:</strong> Returns JWT token and user data</p>';
        }
        
        testingDiv.innerHTML = testingContent;
        content.insertBefore(testingDiv, content.firstChild);
      });
    }, 1000);
  }
  
  // Run after Swagger UI initializes
  const observer = new MutationObserver(() => {
    addSectionHeaders();
    addTestingSections();
    hideDefaultEndpoints();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Initial run
  setTimeout(() => {
    addSectionHeaders();
    addTestingSections();
    hideDefaultEndpoints();
  }, 1000);
  
  // Also run on window load
  window.addEventListener('load', () => {
    setTimeout(() => {
      addSectionHeaders();
      addTestingSections();
      hideDefaultEndpoints();
    }, 1500);
  });
})();

