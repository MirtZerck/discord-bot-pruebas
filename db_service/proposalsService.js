import { db } from "../michi.js";
/* 
La estructura de la propuesta:
category: string,
image: string (url),
user: string (id),
date: string (date)
*/

export class ProposalService {
  constructor(serverId) {
    this.serverId = serverId;
    this.proposalsDB = db.child("servers").child(serverId).child("proposals");
  }

  async getProposals() {
    const proposals = await this.proposalsDB.once("value");
    if (proposals.exists()) {
      return proposals.val();
    } else {
      return undefined;
    }
  }

  async setProposal(proposal) {
    //Se verifica si la propuesta ya existe
    return new Promise(async (resolve, reject) => {
      const proposals = await this.getProposals();
      if (proposals) {
        for (const prop in proposals) {
          if (proposals[prop].image === proposal.image) {
            reject("La propuesta ya existe!");
            return;
          }
        }
      }
      let nextId = (await this.proposalsDB.once("value")).numChildren();
      //si el nextId ya existe, se le suma uno hasta que no exista
      while ((await this.proposalsDB.child(nextId).once("value")).exists()) {
        nextId++;
      }
      await this.proposalsDB
        .child(nextId)
        .set(proposal)
        .then(() => {
          resolve("Propuesta enviada!");
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async deleteProposal(id) {
    return await this.proposalsDB.child(id).remove();
  }
}
