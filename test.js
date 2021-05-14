let sort = (a, b) => {
    let n1 = a.Name.replace("-", ".").match(/\d+.\d+|\d+/);
    let n2 = b.Name.replace("-", ".").match(/\d+.\d+|\d+/);
    
    if (n1 && n2) {
        console.log("a")
      return Number(n1[0]) - Number(n2[0]);
    } else {
        console.log("b")
      return a.Name.replace("-", "Z").localeCompare(b.Name.replace("-", "Z"));
    }
  }


  let datas = [
      {Name:"99-2 ab"},
      {Name:"99-1 ab"},
      {Name:"99 ab"},
      {Name:"200 ab"},
      {Name:"1 ab"},
      {Name:"2 ab"},
      {Name:"12 ab"},
      {Name:"21 ab"},
      {Name:"2000 ab"}
];

console.log(datas.sort(sort));