import { db } from "../michi.js";
import { Proposal } from "../types/proposal.js";

export class ProposalService {
    serverId: string;
    proposalsDB: any;

    constructor(serverId: string) {
        this.serverId = serverId;
        this.proposalsDB = db.child("servers").child(serverId).child("proposals");
    }

    async getProposals(): Promise<[string, Proposal][]> {
        const proposals = await this.proposalsDB.once("value");
        if (proposals.exists()) {
            return Object.entries(proposals.val());
        } else {
            return [];
        }
    }

    async setProposal(proposal: Proposal): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const proposals = await this.getProposals();
            if (proposals) {
                for (const [key, prop] of proposals) {
                    if (prop.image === proposal.image) {
                        reject("La propuesta ya existe!");
                        return;
                    }
                }
            }
            let nextId = (await this.proposalsDB.once("value")).numChildren();
            // si el nextId ya existe, se le suma uno hasta que no exista
            while ((await this.proposalsDB.child(nextId).once("value")).exists()) {
                nextId++;
            }
            await this.proposalsDB
                .child(nextId)
                .set(proposal)
                .then(() => {
                    db.child("servers").child(this.serverId).child("name").set(proposal.serverName);  // Guardar el nombre del servidor
                    resolve("Propuesta enviada!");
                })
                .catch((err: Error) => {
                    reject(err);
                });
        });
    }

    async deleteProposal(id: string): Promise<void> {
        await this.proposalsDB.child(id).remove();
    }
}
