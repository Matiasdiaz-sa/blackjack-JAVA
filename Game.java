import java.util.Scanner;

public class Game {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Deck deck = new Deck();
        Player jugador = new Player();
        Player dealer = new Player();

    
        jugador.addCard(deck.drawCard());
        jugador.addCard(deck.drawCard());
        dealer.addCard(deck.drawCard());
        dealer.addCard(deck.drawCard());

        System.out.println("Tus cartas:");
        jugador.showHand(true);
        System.out.println("Puntaje: " + jugador.getScore());

        System.out.println("\nCartas del dealer:");
        dealer.showHand(false);

        
        while (jugador.getScore() < 21) {
            System.out.print("\n¿Querés otra carta? (s/n): ");
            String opcion = sc.nextLine();
            if (opcion.equalsIgnoreCase("s")) {
                jugador.addCard(deck.drawCard());
                System.out.println("\nTus cartas:");
                jugador.showHand(true);
                System.out.println("Puntaje: " + jugador.getScore());
            } else {
                break;
            }
        }
    
        if (jugador.getScore() > 21) {
            System.out.println("Te pasaste de 21. ¡Perdiste!");
            return;
        }

    
        System.out.println("\nCartas del dealer:");
        dealer.showHand(true);
        while (dealer.getScore() < 17 || (dealer.getScore() < jugador.getScore() && dealer.getScore() < 21)) {
            dealer.addCard(deck.drawCard());
            System.out.println("El dealer pide otra carta...");
            dealer.showHand(true);
        }

        int playerScore = jugador.getScore();
        int dealerScore = dealer.getScore();

        System.out.println("\nPuntaje jugador: " + playerScore);
        System.out.println("Puntaje dealer: " + dealerScore);

        if (dealerScore > 21 || playerScore > dealerScore) {
            System.out.println("¡Ganaste!");
        } else if (playerScore < dealerScore) {
            System.out.println("Perdiste.");
        } else {
            System.out.println("Empate.");
        }
    }
}
