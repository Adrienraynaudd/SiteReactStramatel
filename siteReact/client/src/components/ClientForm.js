// ClientForm.js
import React from 'react';

const ClientForm = ({
  userRoles,
  ID,
  Name,
  setID,
  setName,
  AddDico,
  selectedCompany,
  handleSelectChange,
  companyOptions,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        {(userRoles.includes('bruno') || userRoles.includes('admin')) && (
          <div>
            <label htmlFor="ID">ID:</label>
            <input
              type="text"
              id="ID"
              value={ID}
              onChange={(e) => setID(e.target.value)}
            />

            <label htmlFor="Name">Entreprise:</label>
            <input
              type="text"
              id="Name"
              value={Name}
              onChange={(e) => setName(e.target.value)}
            />

            <button onClick={AddDico}>Ajouter un client</button>
          </div>
        )}
      </div>
      <label htmlFor="companySelect">Entreprise:</label>
      <select
        id="companySelect"
        value={selectedCompany}
        onChange={handleSelectChange}
        style={{ marginRight: '10px' }}
      >
        <option value="All">All</option>
        {companyOptions &&
          companyOptions.map((company, index) => (
            <option key={index} value={company}>
              {company}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ClientForm;
