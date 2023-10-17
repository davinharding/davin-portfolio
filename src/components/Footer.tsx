import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto text-center">
                <div className="mb-4">
                    <a href="https://www.linkedin.com/in/davinharding/" className="mx-2 hover:text-blue-500" target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faLinkedin} size="2x" />
                    </a>
                    <a href="https://github.com/davinharding" className="mx-2 hover:text-gray-500" target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faGithub} size="2x" />
                    </a>
                    {/* You can add more social links following the same pattern */}
                </div>
                <p>&copy; {currentYear} Davin Harding</p>
            </div>
        </footer>
    );
}
