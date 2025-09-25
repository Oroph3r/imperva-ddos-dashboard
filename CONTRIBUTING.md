# 🤝 Contributing to Imperva DDoS Dashboard

We welcome contributions to the Imperva DDoS Dashboard! This document provides guidelines for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Report issues and bugs
- 💡 **Feature Requests**: Suggest new features and improvements
- 📝 **Documentation**: Improve documentation and guides
- 🧪 **Testing**: Write and improve tests
- 💻 **Code Contributions**: Submit code improvements and new features
- 🎨 **UI/UX**: Enhance user interface and experience
- 🔒 **Security**: Report security vulnerabilities

## 📋 Getting Started

### Prerequisites

1. **Development Environment**
   - Python 3.8+
   - Git
   - Code editor (VS Code, PyCharm, etc.)
   - Basic knowledge of Flask and JavaScript

2. **Imperva Access**
   - Imperva account for testing
   - API credentials for development

### Fork and Clone

1. **Fork the Repository**
   - Go to the [GitHub repository](https://github.com/your-username/imperva-ddos-dashboard)
   - Click "Fork" button

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/imperva-ddos-dashboard.git
   cd imperva-ddos-dashboard
   ```

3. **Set Up Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/imperva-ddos-dashboard.git
   ```

### Development Setup

1. **Create Virtual Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/macOS
   # venv\Scripts\activate   # Windows
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your test API credentials
   ```

4. **Run Tests**
   ```bash
   python -m pytest tests/
   ```

## 🔧 Development Workflow

### Branch Strategy

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Branch Naming Convention**
   - `feature/description` - New features
   - `bugfix/description` - Bug fixes
   - `docs/description` - Documentation updates
   - `refactor/description` - Code refactoring
   - `test/description` - Test improvements

### Making Changes

1. **Follow Code Style**
   - Use PEP 8 for Python code
   - Use ESLint rules for JavaScript
   - Add comments for complex logic
   - Write descriptive commit messages

2. **Write Tests**
   - Add unit tests for new functions
   - Add integration tests for new features
   - Ensure existing tests pass
   - Aim for good test coverage

3. **Update Documentation**
   - Update relevant documentation
   - Add docstrings to new functions
   - Update README if needed

### Commit Guidelines

1. **Commit Message Format**
   ```
   type(scope): description

   Longer explanation if needed

   Fixes #issue-number
   ```

2. **Commit Types**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code formatting changes
   - `refactor`: Code refactoring
   - `test`: Test additions/modifications
   - `chore`: Maintenance tasks

3. **Examples**
   ```
   feat(api): add country filtering support
   fix(charts): resolve timeline chart rendering issue
   docs(readme): update installation instructions
   ```

### Testing

1. **Run All Tests**
   ```bash
   python -m pytest tests/ -v
   ```

2. **Run Specific Tests**
   ```bash
   python -m pytest tests/test_api.py -v
   ```

3. **Check Coverage**
   ```bash
   python -m pytest --cov=. tests/
   ```

4. **Linting**
   ```bash
   flake8 .
   pylint app.py api/ config/
   ```

## 📝 Coding Standards

### Python Code Style

1. **PEP 8 Compliance**
   - Maximum line length: 88 characters
   - Use 4 spaces for indentation
   - Use meaningful variable names

2. **Documentation**
   ```python
   def get_ddos_visits(self, site_id, start_time, end_time):
       """
       Fetch DDoS visits from Imperva API.

       Args:
           site_id (str): Imperva site ID
           start_time (int): Start timestamp in milliseconds
           end_time (int): End timestamp in milliseconds

       Returns:
           dict: API response with visits data

       Raises:
           ConnectionError: If API connection fails
       """
   ```

3. **Error Handling**
   ```python
   try:
       response = self.session.post(url, headers=headers)
       response.raise_for_status()
   except requests.exceptions.RequestException as e:
       logger.error(f"API request failed: {e}")
       return {"error": "API connection failed"}
   ```

### JavaScript Code Style

1. **ES6+ Features**
   - Use `const` and `let` instead of `var`
   - Use arrow functions where appropriate
   - Use template literals for string formatting

2. **Function Documentation**
   ```javascript
   /**
    * Process attack data for visualization
    * @param {Array} visits - Array of visit objects
    * @param {Object} options - Processing options
    * @returns {Object} Processed data for charts
    */
   function processAttackData(visits, options) {
       // Implementation
   }
   ```

3. **Error Handling**
   ```javascript
   try {
       const response = await fetch('/api/ddos-report', {
           method: 'POST',
           body: JSON.stringify(data)
       });

       if (!response.ok) {
           throw new Error(`HTTP ${response.status}`);
       }

       return await response.json();
   } catch (error) {
       console.error('API request failed:', error);
       showErrorMessage(error.message);
   }
   ```

### CSS/HTML Standards

1. **CSS Organization**
   - Use meaningful class names
   - Group related styles
   - Use CSS variables for colors and spacing
   - Follow mobile-first responsive design

2. **HTML Structure**
   - Semantic HTML elements
   - Proper accessibility attributes
   - Valid HTML5 structure

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Bug Description**
   - Clear, descriptive title
   - Expected vs. actual behavior
   - Steps to reproduce

2. **Environment Information**
   - Operating system
   - Python version
   - Browser (if applicable)
   - Dashboard version

3. **Logs and Screenshots**
   - Error messages or logs
   - Screenshots if relevant
   - Console output

4. **Bug Report Template**
   ```markdown
   ## Bug Description
   Brief description of the issue

   ## Steps to Reproduce
   1. Go to '...'
   2. Click on '....'
   3. See error

   ## Expected Behavior
   What should happen

   ## Actual Behavior
   What actually happens

   ## Environment
   - OS: [e.g. Ubuntu 20.04]
   - Python: [e.g. 3.9.5]
   - Browser: [e.g. Chrome 91.0]
   ```

## 💡 Feature Requests

For new features, please provide:

1. **Feature Description**
   - Clear explanation of the feature
   - Use cases and benefits
   - Proposed implementation approach

2. **Design Considerations**
   - UI/UX mockups if applicable
   - API changes needed
   - Performance implications

3. **Feature Request Template**
   ```markdown
   ## Feature Summary
   Brief description of the feature

   ## Use Case
   Why is this feature needed?

   ## Proposed Solution
   How should this feature work?

   ## Alternatives Considered
   Other approaches considered

   ## Additional Context
   Screenshots, mockups, etc.
   ```

## 🔒 Security Issues

**IMPORTANT**: Do not report security vulnerabilities in public issues.

1. **Contact Information**
   - Email: security@yourproject.com
   - Encrypted communication preferred

2. **Information to Include**
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **Response Timeline**
   - Initial response: 48 hours
   - Status update: 7 days
   - Resolution target: 30 days

## 📋 Pull Request Process

### Before Submitting

1. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run Tests**
   ```bash
   python -m pytest tests/
   flake8 .
   ```

3. **Update Documentation**
   - Update relevant docs
   - Add changelog entry

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated Checks**
   - Tests must pass
   - Code style checks
   - Security scans

2. **Code Review**
   - Maintainer review required
   - Address feedback promptly
   - Discuss design decisions

3. **Merge Requirements**
   - All checks passing
   - Approved by maintainer
   - Up-to-date with main branch

## 🎯 Project Structure

Understanding the codebase structure:

```
imperva-ddos-dashboard/
├── app.py                 # Main Flask application
├── config/
│   ├── __init__.py
│   └── settings.py        # Configuration management
├── api/
│   ├── __init__.py
│   └── imperva_client.py  # Imperva API client
├── static/
│   ├── css/
│   │   └── main.css       # Dashboard styling
│   └── js/
│       ├── app.js         # Main application logic
│       ├── charts.js      # Chart management
│       └── data-processing.js # Data analysis
├── templates/
│   └── index.html         # Main dashboard template
├── tests/
│   ├── test_api.py        # API tests
│   ├── test_app.py        # Application tests
│   └── fixtures/          # Test data
├── docs/                  # Documentation
└── utils/                 # Utility functions
```

## 🧪 Testing Guidelines

### Test Categories

1. **Unit Tests**
   - Test individual functions
   - Mock external dependencies
   - Fast execution

2. **Integration Tests**
   - Test component interactions
   - Use test database/API
   - Realistic scenarios

3. **End-to-End Tests**
   - Test complete workflows
   - Browser automation
   - User scenarios

### Writing Tests

1. **Test Structure**
   ```python
   def test_function_name():
       # Arrange
       input_data = {...}

       # Act
       result = function_to_test(input_data)

       # Assert
       assert result == expected_output
   ```

2. **Test Naming**
   - `test_function_behavior_condition`
   - `test_get_sites_returns_empty_list_when_no_sites`

3. **Fixtures and Mocking**
   ```python
   @pytest.fixture
   def mock_api_response():
       return {
           "sites": [{"site_id": "123", "domain": "test.com"}]
       }

   def test_get_sites_success(mock_api_response, monkeypatch):
       monkeypatch.setattr(requests, 'post', lambda *args, **kwargs: MockResponse(mock_api_response))
       # Test implementation
   ```

## 🏆 Recognition

Contributors will be recognized:

1. **Contributors File**
   - All contributors listed
   - Contribution categories
   - Contact information (optional)

2. **Release Notes**
   - Contributor acknowledgments
   - Feature attributions
   - Special thanks

3. **GitHub Recognition**
   - Contributor graphs
   - Issue/PR credits
   - Repository insights

## 📞 Community and Support

### Communication Channels

1. **GitHub Discussions**
   - General questions
   - Feature discussions
   - Show and tell

2. **Issues**
   - Bug reports
   - Feature requests
   - Technical questions

3. **Discord/Slack** (if available)
   - Real-time chat
   - Development coordination
   - Community support

### Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/):

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints
- Report inappropriate behavior

## 🎉 Getting Your First Contribution Merged

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`
- `beginner friendly`

### Tips for Success

1. **Start Small**
   - Fix typos or documentation
   - Add missing tests
   - Improve error messages

2. **Ask Questions**
   - Don't hesitate to ask for help
   - Clarify requirements
   - Discuss implementation approaches

3. **Be Patient**
   - Reviews take time
   - Be responsive to feedback
   - Iterate based on suggestions

## 📈 Roadmap and Priorities

Current development priorities:

1. **Performance Improvements**
   - Optimize API requests
   - Improve chart rendering
   - Reduce memory usage

2. **New Features**
   - Real-time monitoring
   - Advanced analytics
   - Export improvements

3. **Platform Support**
   - Docker improvements
   - Cloud deployment guides
   - CI/CD enhancements

## 📝 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing! 🙏**

Every contribution, no matter how small, helps make this project better for everyone.