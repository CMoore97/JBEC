//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace CircleSpaceDAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class Image
    {
        public string ImageName { get; set; }
        public int ID { get; set; }
        public int PageID { get; set; }
        public int UserID { get; set; }
    
        public virtual Page Page { get; set; }
        public virtual User User { get; set; }
    }
}
