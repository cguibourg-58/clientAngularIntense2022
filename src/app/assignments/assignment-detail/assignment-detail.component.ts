import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentsService } from 'src/app/shared/assignments.service';
import { AuthService } from 'src/app/shared/auth.service';
import { Assignment } from '../assignment.model';

@Component({
  selector: 'app-assignment-detail',
  templateUrl: './assignment-detail.component.html',
  styleUrls: ['./assignment-detail.component.css']
})
export class AssignmentDetailComponent implements OnInit {
  assignmentTransmis?:Assignment;
  responsableMatiere?:String; 
  titreResponsable?:String; 
  photoResponsable?:String; 
  imageMatiere?:String;
  rendu?:String;  
  imageRendu?:String;
  dateNow?:Date; 
  dateRendu?:Date; 
  retard?:Boolean;


  constructor(private assignmentService:AssignmentsService,
              private route:ActivatedRoute,
              private router:Router,
              private authService:AuthService) { }

  ngOnInit(): void {
    console.log("DANS COMPOSANT DETAIL")
    this.getAssignment();


  }

  getAssignment() {
    // on récupère l'id dans l'URL
    // le + force la conversion de string à number
    const id:number = +this.route.snapshot.params['id'];
    console.log("ID = " + id);

    this.assignmentService.getAssignment(id)
    .subscribe(assignment => {
      // on utilise this.assignmentTransmis puisque c'est la propriété
      // utilisée dans le template HTML
      this.assignmentTransmis = assignment;
      this.getRendu();
      this.getResponsable();
      this.dateNow = new Date();
      this.dateRendu = this.assignmentTransmis?.dateDeRendu
      this.retard = this.getRetard()
      console.log("date de rendu = " + this.dateRendu)
      console.log("Date d'auj" + this.dateNow)
      console.log("Le devoir est il en retard ? " + this.retard)
    })

  }
  onAssignmentRendu() {
    this.assignmentTransmis!.rendu = true;

    if(this.assignmentTransmis) {
      this.assignmentService.updateAssignment(this.assignmentTransmis)
      .subscribe(reponse => {
        console.log(reponse.message);
        // on est dans le subscribe, on est sur que la base de données a été
        // mise à jour....
        this.router.navigate(["/home"]);
      })
      // PAS BON SI ICI car on n'a pas la garantie que les données ont été updatées
      // this.router.navigate(["/home"]);
    }
  }

  onDeleteAssignment() {
    if(this.assignmentTransmis) {
      this.assignmentService.deleteAssignment(this.assignmentTransmis)
      .subscribe(reponse => {
        console.log(reponse.message);

        // pour faire disparaitre la boite qui affiche le détail
        this.assignmentTransmis = undefined;

        // on affiche liste. Comme on est dans le subscribe, on est sur
        // que les données sont à jour et que l'assignment a été supprimé !
        this.router.navigate(["/home"]);
      })
    }
  }

  onClickEdit() {
    // correspond à /assignment/1/edit?nom=Buffa&prenom=Michel#edit
    //TODO, à récuperer le login
    this.router.navigate(['/assignment', this.assignmentTransmis?.id, 'edit'],
                        {
                          queryParams: {
                            nom:'Buffa',
                            prenom:'Michel'
                        },
                          fragment:'edit'
                      });
  }

  isAdmin() {
    return this.authService.loggedIn;
  }

  getResponsable(){

    console.log(this.assignmentTransmis?.matiere);
    console.log();


    switch(this.assignmentTransmis?.matiere){
      case "BD pour le Big Data" : 
      this.responsableMatiere = "Gabriel MOPOLO";
      this.titreResponsable = "Professor at University of Nice";
      this.photoResponsable = "https://media-exp1.licdn.com/dms/image/C4E03AQHUszC0EvVQrQ/profile-displayphoto-shrink_800_800/0/1517725153393?e=1648684800&v=beta&t=MlYvRidOf0TqeczEZS3HIaEsCxeKwESyPKZXi7s1jkM";
      this.imageMatiere = "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1406&q=80";
      break;
    
    case "Dev Web" : 
      this.responsableMatiere = "Michel BUFFA";
      this.titreResponsable = "Teacher/researcher at CNRS/UNSA";
      this.photoResponsable = "https://i1.rgstatic.net/ii/profile.image/712495153029121-1546883490651_Q512/Michel-Buffa.jpg";
      this.imageMatiere = "data:image/jpeg;base64,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";
      break;

    case "Gestion de projet" : 
      this.responsableMatiere = "Michel WINTER";
      this.titreResponsable = "AI Master Program Coordinator";
      this.photoResponsable = "https://media-exp1.licdn.com/dms/image/C5603AQER1Fa_tvUuiA/profile-displayphoto-shrink_800_800/0/1516265634380?e=1648684800&v=beta&t=RmKwtBPyYmG0fAAdKN8n0w3TbWX60bI-V4FMVp4jARE";
      this.imageMatiere = "https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1039&q=80";
      break;

    case "Création d'entreprise" : 
      this.responsableMatiere = "Nathalie SAUVAGE";
      this.titreResponsable = "Coordinatrice Master 2 SIRIS";
      this.photoResponsable = "http://pro-expertcomptable-nice.com/wp-content/uploads/2021/03/nathaliesauvage.jpg";
      this.imageMatiere = "https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1426&q=80";
      break;

    case "Management du numérique" : 
      this.responsableMatiere = "Stéphane TOUNSI";
      this.titreResponsable = "Responsable pédagogique Licence 3 MIAGE";
      this.photoResponsable = "https://media-exp1.licdn.com/dms/image/C5103AQHVmjKv_sAMNQ/profile-displayphoto-shrink_800_800/0/1516303286403?e=1648684800&v=beta&t=CUx_XgeQjmAXN8sv7QXImwGhYaXSq_js22ErjSq89Jg";
      this.imageMatiere = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80";
      break;
      
    
    ;
  }
}

getRendu(){
  this.rendu = String(this.assignmentTransmis?.rendu)
  console.log("Rendu = " + this.rendu)

 switch(this.rendu){
   case "true" : 
   console.log("nous somme dans true");
       this.imageRendu = "https://cdn-icons-png.flaticon.com/512/3443/3443392.png";

   break;

   case "false" : 
   console.log("nous somme dans false");
       this.imageRendu = "https://cdn-icons-png.flaticon.com/512/3443/3443382.png";

   break;  

 }
 
}

getRetard(){
var retard 

  if (this.dateNow! < this.dateRendu!) {
    console.log("En retard")
    retard = true


}
else {
  console.log("Good ")
  retard = false
}

return retard
}

 
 
};
