export default function Report() {
    return (
      <div className="container">
        <div className="card">
          <h2>Report Issue</h2>
          <input placeholder="Issue Title" />
          <textarea placeholder="Describe the problem"></textarea>
          <button>Submit</button>
        </div>
      </div>
    );
  }
  