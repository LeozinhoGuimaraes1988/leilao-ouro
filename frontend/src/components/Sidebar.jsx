import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FiMenu, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const [aberta, setAberta] = useState(false);
  const sidebarRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setAberta(false);
      }
    };

    if (aberta) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aberta]);

  return (
    <div
      ref={sidebarRef}
      className={`${styles.sidebar} ${aberta ? styles.aberta : ''}`}
    >
      <button className={styles.toggleBtn} onClick={() => setAberta(!aberta)}>
        <FiMenu size={20} />
      </button>

      <nav className={styles.nav}>
        <NavLink to="/configuracoes-cotacao" className={styles.link}>
          <FiSettings className={styles.icon} />
          {aberta && <span>Configuração de Cotação</span>}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
