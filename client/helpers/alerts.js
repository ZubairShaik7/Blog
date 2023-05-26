export const showSuccessMessage = success => {
   return (
      <div className="alert alert-success" role="alert">
         {success}
      </div>
   )
}

export const showErrorMessage = error => {
   return (
      <div className="alert alert-danger" role="alert">
         {error}
      </div>
   )
 }