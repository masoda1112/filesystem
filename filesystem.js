// 開発しましょう。
//引数の分解ができるようにする(/を含んでいたらパス指定モード)
//相対パス
//current以下を/で分解して、最初の文字からchildrenを検索していく
//絶対パス（一番最初に/があるケース）
//rootから、相対パスと同じ処理をしていく

//疑問点
// /での分解はどこで行うべきか？
// 別のクラスで上書きするべきか？

//cd,ls,rm,setContent,print,mkdir
//エラーメッセージを表示する機能を追加して、成果物に投稿

let CLITextInput = document.getElementById("CLITextInput");
let CLIOutputDiv = document.getElementById("CLIOutputDiv");

CLITextInput.addEventListener("keyup",(event) => executeCommand(event));

function executeCommand(event){
    let arr = []
    if(event.key == "Enter"){
        arr = CLITextInput.value.split(" ")
        CLIOutputDiv.innerHTML += `<p>${arr.reduce((str, current) => str + " " + current)}</p>`
        CLITextInput.value = null
        if(arr[0] == "touch"){
            User.touch(arr[1])
        }else if(arr[0] == "mkdir"){
            User.mkdir(arr[1])
        }else if(arr[0] == "ls"){
            if(arr.length == 1) User.ls()
            else User.ls(arr[1])
        }else if(arr[0] == "cd"){
            User.cd(arr[1])
        }else if(arr[0] == "pwd"){
            User.pwd()
        }else if(arr[0] == "setContent"){
            User.setContent(arr[1],arr[2])
        }else if(arr[0] == "print"){
            User.print(arr[1])
        }else if(arr[0] == "rm"){
            User.rm(arr[1])
        }else{
            CLIOutputDiv.innerHTML += "存在しないコマンドです"
        }
    }
}

class Node{
    constructor(name, parent, type, dateModified){
        this.name = name,
        this.parent = parent,
        this.dateModified = dateModified,
        this.children = {},
        this.content = "",
        this.type = type
    }
}

class User{
    //defaultでrootに設定
    static root = new Node("root",null,"dir",null)
    static current = User.root

    static touch(fileName){
        let date = new Date()
        let node = new Node(fileName,this.current.name,"file",date.toLocaleString())
        this.current.children[node.name] = node
        node.parent = this.current
    }

    static mkdir(dirName){
        let date = new Date()
        if(dirName.includes("/")){
            let arr = dirName.split("/")
            let name = arr[arr.length - 1]
            arr.pop()
            let string = arr.reduce((total, str) => total + "/" + str)
            let parent = this.movePath(string)
            if(parent.children[name] != undefined){
                CLIOutputDiv.innerHTML += "<p>指定のdirが既に存在します</p>"
            }else{
                let node = new Node(name,parent.name,"dir",date.toLocaleString())
                parent.children[node.name] = node
                node.parent = parent
            }
        }else{
            if(this.current.children[dirName] != undefined){
                CLIOutputDiv.innerHTML += "<p>指定のdirが既に存在します</p>"
            }else{
                let node = new Node(dirName,this.name,"dir",date.toLocaleString())
                this.current.children[node.name] = node
                node.parent = this.current
            }
        }
    }

    static ls(childrenName){
        let cur = this.current
        let file = this.isFile(cur)
        if(file[0]) CLIOutputDiv.innerHTML += file[1]
        if(childrenName == null){
            for(let key in cur.children){
                let value = cur.children[key].name
                CLIOutputDiv.innerHTML += `<p>${value}</p>`
            }
        }else{
            if(childrenName.includes("/")){
                cur = this.movePath(childrenName)
                let pathExist = this.existing(cur)
                if(!pathExist[0]){
                    CLIOutputDiv.innerHTML += `<p>${pathExist[1]}</p>`
                }else{
                    for(let key in cur.children){
                        CLIOutputDiv.innerHTML += `<p>${cur.children[key].name}</p>`
                    }
                }
            }else{
                let nodeExist = this.existing(cur.children[childrenName])
                if(!nodeExist[0]){
                    CLIOutputDiv.innerHTML += `<p>${nodeExist[1]}</p>`
                }else{
                    cur = cur.children[childrenName]
                    for(let key in cur.children){
                        CLIOutputDiv.innerHTML += `<p>${cur.children[key].name}</p>`
                    }
                }
            }
        }
    }

    static cd(name){
        if(name == "../"){
            if(this.current.parent == undefined) CLIOutputDiv.innerHTML += "current is root"
            else this.current = this.current.parent
        }else{
            let node = null
            name.includes("/") ? node = this.movePath(name) : node = this.current.children[name]
            {
                let exist = this.existing(node)
                if(!exist[0]){
                    CLIOutputDiv.innerHTML += `<p>${exist[1]}</p>`
                }else{
                    let dir = this.isFile(node)
                    if(dir[0]){
                        CLIOutputDiv.innerHTML += `<p>${dir[1]}</p>`
                    }else{
                        this.current = node
                    }
                }
            }
        }
    }

    static pwd(){
        CLIOutputDiv.innerHTML += `<p>${this.current.name}</p>`
    }

    static setContent(fileName, newContent){
        let node = null
        fileName.includes("/") ? node = this.movePath(fileName) :
        node = this.current.children[fileName]
        let exist = this.existing(node)
        if(!exist[0]){
            CLIOutputDiv.innerHTML += `<p>${exist[1]}</p>`
        }else{
            let file = this.isFile(node)
            if(!file[0]){
                CLIOutputDiv.innerHTML += `<p>${file[1]}</p>`
            }else{
                node.content = newContent
                CLIOutputDiv.innerHTML += `<p>${node.content}</p>`
            }     
        }
    }

    static print(fileName){
        let node = null
        fileName.includes("/") ? node = this.movePath(fileName) :
        node = this.current.children[fileName]
        let exist = this.existing(node)
        if(!exist[0]){
            CLIOutputDiv.innerHTML += `<p>${exist[1]}</p>`
        }else{
            let file = this.isFile(node)
            if(!file[0]){
                CLIOutputDiv.innerHTML += `<p>${file[1]}</p>`
            }else{
                CLIOutputDiv.innerHTML += `<p>${node.content}</p>`
            }        
        }
    }

    static rm(name){
        let node = null
        name.includes("/") ? node = this.movePath(name) : node = this.current.children[name]
        let exist = this.existing(node)

        if(!exist[0]){
            CLIOutputDiv.innerHTML += `<p>${exist[1]}</p>`
        }else{
            let file = this.isFile(node)
            if(!file[0]){
                CLIOutputDiv.innerHTML += `<p>${file[1]}</p>`
            }else{
                if(name.includes("/")){
                    delete this.movePath(name).parent.children[this.movePath(name).name]
                }else{
                    delete this.current.children[name]
                }
            }
        }
        
    }

    static movePath(name){
        let array = name.split("/")
        let cur = User.root
        if(name[0] == "/"){
            for(let i = 1; i < array.length; i++){
                cur = cur.children[array[i]]
            }
        }else{
            cur = User.current
            for(let i = 0; i < array.length; i++){
                cur = cur.children[array[i]]
            }
        }
        return cur
    }

    static existing(node){
        let res = [true,"指定されたPathが既に存在します"]
        if(node == undefined){
            res = [false,"指定されたPathが存在しません"]
        }
        return res
    }

    static isFile(node){
        console.log(node)
        let res = [true,"指定されたPathはFileTypeです"]
        if(node.type == "dir"){
            res = [false,"指定されたPathはdirTypeです"]
        }
        return res
    }
}